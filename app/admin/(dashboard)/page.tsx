import { ArrowUpRight, Ban, CalendarPlus, Images, Sofa } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { expireStaleHolds } from "@/lib/availability";
import { formatNaira } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const STATUS_BADGES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  await expireStaleHolds();

  const [totalBookings, pendingBookings, confirmedBookings, upcomingConfirmed, unreadInquiries, recentBookings] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { bookingStatus: "pending_payment" } }),
      prisma.booking.count({ where: { bookingStatus: "confirmed" } }),
      prisma.booking.count({
        where: { bookingStatus: "confirmed", checkOut: { gte: new Date() } },
      }),
      prisma.inquiry.count({ where: { status: "new" } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { apartment: { select: { name: true } } },
      }),
    ]);

  const upcoming = await prisma.booking.findMany({
    where: { bookingStatus: "confirmed", checkIn: { gte: new Date() } },
    orderBy: { checkIn: "asc" },
    take: 4,
    include: { apartment: { select: { name: true } } },
  });

  const stats = [
    { label: "Total Bookings", value: String(totalBookings) },
    { label: "Pending Bookings", value: String(pendingBookings) },
    { label: "Confirmed Bookings", value: String(confirmedBookings) },
    { label: "Upcoming Stays", value: String(upcomingConfirmed) },
    { label: "Unread Inquiries", value: String(unreadInquiries) },
  ];

  return (
    <div className="space-y-10">
      <p className="font-serif text-3xl text-charcoal">
        {greeting()}, Admin
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-charcoal/10 bg-white p-5">
            <p className="font-sans text-[10px] uppercase tracking-label text-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-4xl text-charcoal">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-charcoal">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand-red"
          >
            View all
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="mt-4 border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
            No bookings yet — they will appear here as guests book on the website.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-charcoal/10 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-charcoal/10 bg-cream/40">
                <tr className="font-sans text-[10px] uppercase tracking-label text-muted">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3">
                      <p className="text-charcoal">{booking.guestName}</p>
                      <p className="text-xs text-muted">{booking.apartment.name}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {booking.checkIn.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {booking.checkOut.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3 text-charcoal">{formatNaira(booking.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGES[booking.bookingStatus] ?? "bg-charcoal/10 text-charcoal"}`}
                      >
                        {booking.bookingStatus.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Upcoming + quick actions */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl text-charcoal">Upcoming Bookings</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
              No upcoming confirmed stays.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-charcoal/5 border border-charcoal/10 bg-white">
              {upcoming.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                  <div>
                    <p className="text-charcoal">{booking.guestName}</p>
                    <p className="text-xs text-muted">
                      {booking.apartment.name} · {booking.nights} night{booking.nights === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-right text-charcoal">
                    {booking.checkIn.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    <span className="text-muted"> → </span>
                    {booking.checkOut.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-serif text-2xl text-charcoal">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickAction href="/admin/availability" icon={CalendarPlus} label="Block Dates" />
            <QuickAction href="/admin/bookings" icon={Ban} label="View Bookings" />
            <QuickAction href="/admin/apartment" icon={Sofa} label="Edit Apartment" />
            <QuickAction href="/admin/gallery" icon={Images} label="Manage Gallery" />
            <QuickAction href="/" label="View Website" external />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  external = false,
}: {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}) {
  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4 text-brand-red" aria-hidden="true" /> : null}
      <span>{label}</span>
    </>
  );
  const className =
    "flex items-center gap-3 border border-charcoal/10 bg-white px-4 py-3.5 text-sm text-charcoal transition-colors hover:border-brand-red";

  if (external) {
    return (
      <Link href={href} className={className} target="_blank">
        {content}
      </Link>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
