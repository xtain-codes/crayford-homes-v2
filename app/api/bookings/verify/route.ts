import { NextResponse } from "next/server";

import {
  expireStaleHolds,
  findConfirmedOverlap,
  nightsBetween,
  parseDayKey,
} from "@/lib/availability";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/";

/**
 * POST /api/bookings/verify
 *
 * The final step of the booking flow:
 *   1. Verifies the Paystack transaction server-side (never trusts the client).
 *   2. Inside ONE transaction: re-checks availability, marks the booking
 *      CONFIRMED + paid — or rejects with 409 if the dates were taken.
 *   3. Sends the "payment received" email via Resend.
 *
 * Until this route confirms the booking, the dates stay only *held* (and the
 * hold expires automatically), so failed or cancelled payments never block
 * dates permanently.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { bookingReference, paymentReference } = parsed.data;

  try {
    await expireStaleHolds();

    const booking = await prisma.booking.findUnique({
      where: { reference: bookingReference },
      include: { apartment: { select: { name: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.bookingStatus === "confirmed") {
      // Idempotent success — e.g. a double-submit.
      return NextResponse.json({
        confirmed: true,
        emailSent: false,
        message: "This booking was already confirmed.",
      });
    }
    if (booking.bookingStatus !== "pending_payment") {
      return NextResponse.json(
        { error: "This booking is no longer active. Please start a new booking." },
        { status: 409 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payments are not configured yet — see README (Paystack setup)." },
        { status: 503 }
      );
    }

    // ── 1. Verify the charge directly with Paystack ────────────────────────
    let verified = false;
    let paystackAmountKobo: number | null = null;
    try {
      const response = await fetch(
        `${PAYSTACK_VERIFY_URL}${encodeURIComponent(paymentReference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` }, cache: "no-store" }
      );
      const result = (await response.json()) as {
        status: boolean;
        data?: { status: string; amount: number; currency: string; metadata?: unknown };
      };
      verified =
        response.ok &&
        result.status === true &&
        result.data?.status === "success" &&
        result.data.currency === "NGN";
      paystackAmountKobo = result.data?.amount ?? null;
    } catch {
      return NextResponse.json(
        { error: "Could not reach Paystack to verify the payment. Please try again." },
        { status: 502 }
      );
    }

    if (!verified) {
      return NextResponse.json(
        { error: "We could not verify this payment. If you were charged, please contact us with the payment reference." },
        { status: 402 }
      );
    }

    // Amount must match the booking's stored total (Paystack reports kobo).
    const expectedKobo = booking.amount * 100;
    if (paystackAmountKobo !== null && paystackAmountKobo !== expectedKobo) {
      return NextResponse.json(
        { error: "Payment amount does not match the booking total." },
        { status: 409 }
      );
    }

    // ── 2. Confirm the booking transactionally ─────────────────────────────
    const checkIn = parseDayKey(booking.checkIn.toISOString().slice(0, 10)) ?? booking.checkIn;
    const checkOut = parseDayKey(booking.checkOut.toISOString().slice(0, 10)) ?? booking.checkOut;

    try {
      const confirmed = await prisma.$transaction(async (tx) => {
        // Re-check availability INSIDE the transaction — the double-booking
        // guard. SQLite serializes writes; Postgres: use SELECT ... FOR UPDATE
        // semantics via the overlap query + a retry on unique violations.
        const overlap = await findConfirmedOverlap(
          booking.apartmentId,
          checkIn,
          checkOut
        );
        if (overlap) {
          throw new Error("OVERLAP");
        }

        return tx.booking.update({
          where: { reference: booking.reference },
          data: {
            bookingStatus: "confirmed",
            paymentStatus: "paid",
            paymentReference,
            paidAt: new Date(),
            holdExpiresAt: null,
          },
        });
      });

      // ── 3. Confirmation email (best-effort; booking is already confirmed) ─
      const emailResult = await sendBookingConfirmationEmail({
        email: booking.email,
        apartmentName: booking.apartment.name,
        checkIn,
        checkOut,
        nights: nightsBetween(checkIn, checkOut),
        guests: booking.guests,
        total: booking.amount,
        reference: booking.reference,
      });

      return NextResponse.json({
        confirmed: true,
        emailSent: emailResult.sent,
        message: emailResult.sent ? undefined : emailResult.reason,
        bookingReference: confirmed.reference,
        total: confirmed.amount,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "OVERLAP") {
        return NextResponse.json(
          {
            error:
              "Some of these dates were just booked by someone else. If you were charged, we will contact you about a refund or alternative dates.",
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("POST /api/bookings/verify failed:", error);
    return NextResponse.json(
      { error: "We could not verify your payment. Please try again or contact us." },
      { status: 500 }
    );
  }
}
