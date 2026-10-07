"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: { prefix: string; title: string }[] = [
  { prefix: "/admin/availability", title: "Availability" },
  { prefix: "/admin/bookings", title: "Bookings" },
  { prefix: "/admin/apartment", title: "Apartment" },
  { prefix: "/admin/rooms", title: "Rooms" },
  { prefix: "/admin/amenities", title: "Amenities" },
  { prefix: "/admin/gallery", title: "Gallery" },
  { prefix: "/admin/inquiries", title: "Inquiries" },
  { prefix: "/admin/settings", title: "Settings" },
];

export function AdminHeader({ sessionEmail }: { sessionEmail: string }) {
  const pathname = usePathname();
  const match = TITLES.filter((item) => pathname.startsWith(item.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];

  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-white/95 backdrop-blur lg:top-0">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-label text-muted">
            <Link href="/admin" className="transition-colors hover:text-brand-red">
              Admin
            </Link>
            {match ? ` / ${match.title}` : ""}
          </p>
          <h1 className="truncate font-serif text-2xl font-medium text-charcoal">
            {match?.title ?? "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="btn-outline hidden sm:inline-flex"
          >
            View Website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red font-sans text-xs font-semibold text-white">
            {sessionEmail.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
