import crypto from "crypto";
import { NextResponse } from "next/server";

import {
  expireStaleHolds,
  holdExpiry,
  isRangeAvailable,
  nightsBetween,
  parseDayKey,
} from "@/lib/availability";
import { getBookableApartments } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * POST /api/bookings — creates a booking hold.
 *
 * Server-side validation is the security boundary: dates are re-checked
 * against confirmed bookings, admin blocks and live holds. The amount is
 * computed from the apartment's DB price — the client never dictates it.
 *
 * The hold is PENDING_PAYMENT and expires automatically (HOLD_MINUTES), so a
 * failed/abandoned payment never permanently blocks dates.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking details." },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    // Clear out expired holds so their dates free up before validation.
    await expireStaleHolds();

    const apartments = await getBookableApartments();
    const apartment = apartments.find((a) => a.slug === input.apartmentSlug);
    if (!apartment) {
      return NextResponse.json({ error: "This apartment is not available for booking." }, { status: 404 });
    }

    const checkIn = parseDayKey(input.checkIn);
    const checkOut = parseDayKey(input.checkOut);
    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "Use a valid date (yyyy-mm-dd)." }, { status: 400 });
    }

    const earliest = new Date();
    earliest.setHours(0, 0, 0, 0);
    if (checkIn.getTime() < earliest.getTime()) {
      return NextResponse.json({ error: "Check-in cannot be in the past." }, { status: 400 });
    }
    if (checkOut.getTime() <= checkIn.getTime()) {
      return NextResponse.json({ error: "Check-out must be after check-in." }, { status: 400 });
    }
    if (input.guests > apartment.maxGuests) {
      return NextResponse.json(
        { error: `${apartment.name} accommodates up to ${apartment.maxGuests} guests.` },
        { status: 400 }
      );
    }

    // The critical check — rejects booked, blocked and held dates server-side.
    const availability = await isRangeAvailable(apartment.id, checkIn, checkOut);
    if (!availability.ok) {
      return NextResponse.json({ error: availability.error }, { status: 409 });
    }

    const nights = nightsBetween(checkIn, checkOut);
    const amount = nights * apartment.pricePerNight;
    const reference = `CR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        reference,
        apartmentId: apartment.id,
        guestName: input.guestName,
        email: input.email,
        phone: input.phone,
        checkIn,
        checkOut,
        guests: input.guests,
        nights,
        amount,
        notes: input.notes,
        bookingStatus: "pending_payment",
        paymentStatus: "pending",
        holdExpiresAt: holdExpiry(),
      },
      select: { reference: true, amount: true, nights: true },
    });

    return NextResponse.json({
      bookingReference: booking.reference,
      amount: booking.amount,
      nights: booking.nights,
      apartmentName: apartment.name,
      pricePerNight: apartment.pricePerNight,
    });
  } catch (error) {
    console.error("POST /api/bookings failed:", error);
    return NextResponse.json({ error: "Could not start your booking. Please try again." }, { status: 500 });
  }
}
