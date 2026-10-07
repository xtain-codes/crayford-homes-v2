import { formatNaira, formatStayDate } from "@/lib/booking";

/**
 * Transactional email via Resend.
 *
 * Required env: RESEND_API_KEY, EMAIL_FROM (e.g. "Crayford <bookings@domain.com>").
 * When unset, sendBookingConfirmationEmail reports emailSent: false — the
 * caller decides how to surface that honestly. Nothing is faked.
 */

export type BookingEmailDetails = {
  email: string;
  apartmentName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  total: number;
  reference: string;
};

function bookingEmailHtml(details: BookingEmailDetails): string {
  const { apartmentName, checkIn, checkOut, nights, guests, total, reference } = details;
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF9F6;padding:32px;">
      <p style="letter-spacing:0.3em;font-size:20px;color:#111111;margin:0 0 4px;">CRAYFORD</p>
      <p style="letter-spacing:0.18em;font-size:11px;color:#B89B5E;margin:0 0 28px;">THOUGHTFULLY DESIGNED STAYS</p>
      <h1 style="font-size:22px;color:#111111;margin:0 0 12px;">Payment received.</h1>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
        Thank you — your payment of <strong>${formatNaira(total)}</strong> for
        <strong>${apartmentName}</strong> has been received successfully.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:8px 0;color:#777;">Booking reference</td><td style="text-align:right;">${reference}</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Check-in</td><td style="text-align:right;">${formatStayDate(checkIn)}</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Check-out</td><td style="text-align:right;">${formatStayDate(checkOut)}</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Nights</td><td style="text-align:right;">${nights}</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Guests</td><td style="text-align:right;">${guests}</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Total paid</td><td style="text-align:right;"><strong>${formatNaira(total)}</strong></td></tr>
      </table>
      <p style="font-size:13px;color:#777;line-height:1.6;margin:28px 0 0;">
        Our team will be in touch to confirm your arrival details. We look forward to hosting you.
      </p>
    </div>`;
}

export async function sendBookingConfirmationEmail(
  details: BookingEmailDetails
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return { sent: false, reason: "Email is not configured yet (RESEND_API_KEY / EMAIL_FROM)." };
  }

  const { apartmentName, nights } = details;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [details.email],
        subject: `Payment received — ${apartmentName}, ${nights} night${nights === 1 ? "" : "s"}`,
        html: bookingEmailHtml(details),
      }),
    });
    if (!response.ok) {
      console.error("Resend error:", await response.text());
      return { sent: false, reason: "The confirmation email failed to send." };
    }
    return { sent: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { sent: false, reason: "The confirmation email failed to send." };
  }
}
