import { AvailabilityCalendar } from "@/components/admin/AvailabilityCalendar";
import { getAvailability, type DayState } from "@/lib/availability";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  await requireAdmin();

  const apartments = await prisma.apartment.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  });

  // Load one year of day states per apartment (past days included for context).
  const daysByApartment: Record<string, DayState[]> = {};
  await Promise.all(
    apartments.map(async (apartment) => {
      daysByApartment[apartment.id] = (
        await getAvailability(apartment.id, { includePast: true, days: 365 })
      ).days;
    })
  );

  if (apartments.length === 0) {
    return (
      <p className="border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
        No active apartments to manage.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-muted">
        Green dates are open for bookings. Blocked dates disappear from the public booking
        calendar immediately; confirmed bookings appear in blue and cannot be blocked over.
      </p>
      <AvailabilityCalendar apartments={apartments} daysByApartment={daysByApartment} />
    </div>
  );
}
