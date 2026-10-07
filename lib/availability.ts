import { prisma } from "@/lib/prisma";

/**
 * Availability service — the single source of truth for which dates are
 * bookable. Both the public website and the admin dashboard read through
 * this module; nothing else interprets bookings or blocks.
 *
 * Semantics:
 *  - All dates are LOCAL MIDNIGHT. A stay occupies [checkIn, checkOut) — the
 *    check-out day is bookable by the next guest.
 *  - A date is unavailable when: it is in the past, covered by a CONFIRMED
 *    booking, covered by a live admin block, or held by a PENDING_PAYMENT
 *    booking that has not yet expired.
 */

export const NIGHT_MS = 86_400_000;

/** The date-grid helpers all work on local-midnight dates. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function today(): Date {
  return startOfDay(new Date());
}

/** Parses a yyyy-mm-dd string as a local-midnight Date, or returns null. */
export function parseDayKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

/** yyyy-mm-dd key for a date. */
export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole nights between two local-midnight dates. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((startOfDay(checkOut).getTime() - startOfDay(checkIn).getTime()) / NIGHT_MS);
}

/** Enumerates every day key in [start, end). */
export function eachDayKey(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor.getTime() < last.getTime()) {
    keys.push(toDayKey(cursor));
    cursor.setTime(cursor.getTime() + NIGHT_MS);
  }
  return keys;
}

export type DayStatus = "booked" | "blocked" | "held" | "past" | "available";

export type DayState = {
  date: string; // yyyy-mm-dd
  status: DayStatus;
  /** Present when booked/held — the booking reference for the admin UI. */
  bookingReference?: string;
  bookingId?: string;
  /** Present when blocked — the BlockedDate id + reason. */
  blockId?: string;
  blockReason?: string;
};

export type AvailabilitySnapshot = {
  apartmentId: string;
  /** Every day from today through the window end, with its status. */
  days: DayState[];
};

type LoadOptions = {
  /** Include past days (admin calendar shows them greyed out). */
  includePast?: boolean;
  /** How far ahead to load, in days. Default 365. */
  days?: number;
};

/**
 * Loads the availability map for one apartment. Everything the calendar UIs
 * (public picker, admin calendar) and the server validators need.
 */
export async function getAvailability(
  apartmentId: string,
  options: LoadOptions = {}
): Promise<AvailabilitySnapshot> {
  const { includePast = false, days = 365 } = options;
  const windowStart = includePast ? new Date(today().getTime() - 90 * NIGHT_MS) : today();
  const windowEnd = new Date(today().getTime() + days * NIGHT_MS);

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        apartmentId,
        checkOut: { gt: windowStart },
        checkIn: { lt: windowEnd },
        bookingStatus: { in: ["pending_payment", "confirmed"] },
      },
      select: { id: true, reference: true, checkIn: true, checkOut: true, bookingStatus: true, holdExpiresAt: true },
    }),
    prisma.blockedDate.findMany({
      where: {
        apartmentId,
        endDate: { gt: windowStart },
        startDate: { lt: windowEnd },
      },
      select: { id: true, startDate: true, endDate: true, reason: true },
    }),
  ]);

  const states = new Map<string, DayState>();

  // Past days (greyed out in the admin calendar).
  if (includePast) {
    for (const key of eachDayKey(windowStart, today())) {
      states.set(key, { date: key, status: "past" });
    }
  }

  // Confirmed bookings win first (strongest claim).
  for (const booking of bookings) {
    if (booking.bookingStatus !== "confirmed") continue;
    for (const key of eachDayKey(booking.checkIn, booking.checkOut)) {
      states.set(key, {
        date: key,
        status: "booked",
        bookingId: booking.id,
        bookingReference: booking.reference,
      });
    }
  }

  // Admin blocks next.
  for (const block of blocks) {
    for (const key of eachDayKey(block.startDate, block.endDate)) {
      const existing = states.get(key);
      if (existing?.status === "booked") continue; // a real booking outranks a block display-wise
      states.set(key, { date: key, status: "blocked", blockId: block.id, blockReason: block.reason });
    }
  }

  // Live holds last (weakest claim, cannot override the above).
  const now = Date.now();
  for (const booking of bookings) {
    if (booking.bookingStatus !== "pending_payment") continue;
    const expired = booking.holdExpiresAt ? booking.holdExpiresAt.getTime() < now : false;
    if (expired) continue;
    for (const key of eachDayKey(booking.checkIn, booking.checkOut)) {
      if (!states.has(key)) {
        states.set(key, {
          date: key,
          status: "held",
          bookingId: booking.id,
          bookingReference: booking.reference,
        });
      }
    }
  }

  // Everything else in the window is available.
  for (const key of eachDayKey(today(), windowEnd)) {
    if (!states.has(key)) states.set(key, { date: key, status: "available" });
  }

  return {
    apartmentId,
    days: Array.from(states.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/** Statuses that make a day unbookable for a new guest. */
export function isBookableStatus(status: DayStatus): boolean {
  return status === "available";
}

/** True when every day in [checkIn, checkOut) is bookable. */
export async function isRangeAvailable(
  apartmentId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (checkOut.getTime() <= checkIn.getTime()) {
    return { ok: false, error: "Check-out must be after check-in." };
  }
  const snapshot = await getAvailability(apartmentId);
  const byKey = new Map(snapshot.days.map((day) => [day.date, day]));
  for (const key of eachDayKey(checkIn, checkOut)) {
    const day = byKey.get(key);
    if (!day || !isBookableStatus(day.status)) {
      return {
        ok: false,
        error: "Some of the selected dates are no longer available. Please choose another date range.",
      };
    }
  }
  return { ok: true };
}

/**
 * Server-side double-booking guard, run INSIDE the confirm transaction.
 * Returns the conflicting booking (if any) for the given apartment and range.
 * A booking excludes itself when re-confirming.
 */
export async function findConfirmedOverlap(
  apartmentId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
) {
  return prisma.booking.findFirst({
    where: {
      apartmentId,
      bookingStatus: "confirmed",
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true, reference: true },
  });
}

/** Cancels stale holds older than their expiry. Call before availability reads. */
export async function expireStaleHolds(): Promise<number> {
  const result = await prisma.booking.updateMany({
    where: {
      bookingStatus: "pending_payment",
      holdExpiresAt: { lt: new Date() },
    },
    data: { bookingStatus: "cancelled", paymentStatus: "failed" },
  });
  return result.count;
}

export const HOLD_MINUTES = 30;

/** Hold expiry timestamp for a new pending booking. */
export function holdExpiry(): Date {
  return new Date(Date.now() + HOLD_MINUTES * 60_000);
}
