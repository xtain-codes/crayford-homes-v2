import { AdminBookingsTable } from "@/components/admin/BookingTable";
import { expireStaleHolds } from "@/lib/availability";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireAdmin();
  await expireStaleHolds();

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { apartment: { select: { name: true } } },
  });

  // Serialize Dates to ISO strings for the client component.
  const serialized = bookings.map((booking) => ({
    id: booking.id,
    reference: booking.reference,
    guestName: booking.guestName,
    email: booking.email,
    phone: booking.phone,
    apartmentName: booking.apartment.name,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    nights: booking.nights,
    guests: booking.guests,
    amount: booking.amount,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
    paymentReference: booking.paymentReference,
    notes: booking.notes,
    holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
    paidAt: booking.paidAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
  }));

  return <AdminBookingsTable bookings={serialized} />;
}
