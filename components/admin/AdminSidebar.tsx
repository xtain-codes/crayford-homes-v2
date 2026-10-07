"use client";

import {
  CalendarDays,
  CalendarX,
  Home,
  Inbox,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  Sofa,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/BrandLogo";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Availability", href: "/admin/availability", icon: CalendarDays },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarX },
  { label: "Apartment", href: "/admin/apartment", icon: Sofa },
  { label: "Rooms", href: "/admin/rooms", icon: MessageSquareQuote },
  { label: "Amenities", href: "/admin/amenities", icon: Sparkles },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

export function AdminSidebar({ sessionEmail }: { sessionEmail: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const navList = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <Link
          href="/admin"
          className="transition-opacity hover:opacity-80"
          aria-label="Crayford admin — dashboard"
        >
          <BrandLogo className="h-8 w-auto" light />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-white/70 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              isActive(item.href)
                ? "bg-white font-medium text-brand-red"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          View Website
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </form>
        <p className="truncate px-3 pt-3 text-xs text-white/40">{sessionEmail}</p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-charcoal/10 bg-warmwhite px-4 lg:hidden">
        <Link href="/admin" className="transition-opacity hover:opacity-80" aria-label="Crayford admin — dashboard">
          <BrandLogo className="h-8 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 text-charcoal"
          aria-label="Open admin menu"
          aria-expanded={open}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-warmblack/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-red">{navList}</aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brand-red lg:block">
        {navList}
      </aside>
    </>
  );
}
