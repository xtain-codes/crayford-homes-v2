import { siteConfig } from "@/lib/site";

/** Formats a Naira amount without decimals, e.g. ₦240,000 */
export function formatNaira(amount: number): string {
  return `${siteConfig.currency}${amount.toLocaleString("en-NG")}`;
}

/** Today at midnight (local) — used as the earliest bookable date. */
function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parses a yyyy-mm-dd string as a local-midnight Date (no timezone drift). */
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a Date for an <input type="date"> value. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type StayDetails = {
  checkIn: Date;
  checkOut: Date;
  nights: number;
};

/**
 * Validates a check-in/check-out pair.
 * Rules: check-in is today or later, check-out is strictly after check-in.
 */
export function validateStay(checkIn: string, checkOut: string): { ok: true; stay: StayDetails } | { ok: false; error: string } {
  const inDate = parseDateInput(checkIn);
  const outDate = parseDateInput(checkOut);
  if (!inDate || !outDate) {
    return { ok: false, error: "Choose both a check-in and a check-out date." };
  }

  const earliest = todayStart();
  if (inDate.getTime() < earliest.getTime()) {
    return { ok: false, error: "Check-in cannot be in the past." };
  }
  if (outDate.getTime() <= inDate.getTime()) {
    return { ok: false, error: "Check-out must be after check-in." };
  }

  const nights = Math.round((outDate.getTime() - inDate.getTime()) / 86_400_000);
  return { ok: true, stay: { checkIn: inDate, checkOut: outDate, nights } };
}

/** Total cost for a stay: nights × the nightly rate. */
export function calculateTotal(nights: number): number {
  return nights * siteConfig.pricePerNight;
}

/** Human-readable date, e.g. "Fri, 3 Oct 2026". */
export function formatStayDate(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type BookingPayload = {
  apartmentName: string;
  guests: number;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  /** Payment reference returned by Paystack. */
  paymentReference?: string;
};

/**
 * Builds the payload sent to /api/booking-confirmation after a successful
 * Paystack charge. The route verifies the reference server-side, then emails
 * the guest a "payment received" confirmation.
 */
export function buildConfirmationRequest(booking: BookingPayload): {
  reference: string;
  email: string;
  apartmentName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
} {
  return {
    reference: booking.paymentReference ?? "",
    email: booking.email,
    apartmentName: booking.apartmentName,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    guests: booking.guests,
    total: booking.total,
  };
}
