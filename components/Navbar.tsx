"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { BrandLogo } from "@/components/BrandLogo";
import { navigationLinks, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTopOfPage, setAtTopOfPage] = useState(true);
  const pathname = usePathname();

  // Routes whose top section is a dark cinematic hero — the navbar starts
  // transparent there and turns solid on scroll. /location has a light top,
  // so it is always solid.
  const overHero = false;
  const solid = isScrolled || menuOpen || !atTopOfPage || !overHero;
  const transparent = overHero && !solid;

  const syncScrollState = useCallback(() => {
    setIsScrolled(window.scrollY > 24);
    setAtTopOfPage(window.scrollY <= 4);
  }, []);

  useEffect(() => {
    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, [syncScrollState]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Handle anchor links ("/#amenities") when already on the home page.
  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#") && pathname === "/") {
      event.preventDefault();
      const id = href.slice(2);
      setMenuOpen(false);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AnnouncementBar />
      <nav
        aria-label="Primary"
        className={cn(
          "transition-all duration-500 ease-smooth",
          transparent
            ? "bg-transparent"
            : "border-b border-charcoal/10 bg-[#f7f0e1]/95 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="transition-opacity duration-500 hover:opacity-80"
            aria-label="Crayford Homes — home"
          >
            <BrandLogo
              className="h-8 w-auto"
              light={transparent}
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(event) => handleAnchorClick(event, link.href)}
                className={cn(
                  "group relative font-sans text-[11px] font-medium uppercase tracking-label transition-colors duration-500",
                  transparent ? "text-[#23212c]/90 hover:text-white" : "text-charcoal/80 hover:text-charcoal",
                  !transparent && pathname === link.href && link.href !== "/#amenities" && "text-brand-red font-medium"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-px transition-all duration-300 ease-smooth",
                    transparent ? "bg-brand-pink" : "bg-brand-red",
                    pathname === link.href && link.href !== "/#amenities"
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className={cn(
                "btn hidden min-h-[40px] px-6 py-2 lg:inline-flex",
                transparent
                  ? "border border-white/70 text-white hover:bg-white hover:text-charcoal"
                  : "rounded-[20px] bg-[#23212c] text-white hover:bg-[#38343c]"
              )}
            >
              Book a Stay
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center transition-colors duration-500 lg:hidden",
              transparent ? "text-white" : "text-charcoal"
            )}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      {menuOpen ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col bg-[#f7f0e1] animate-fade-in lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6 pt-[36px] sm:px-8">
            <BrandLogo className="h-8 w-auto" />
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center px-8">
            <ul className="space-y-2">
              {[...navigationLinks, { label: "Book a Stay", href: "/book" }].map(
                (link, index) => (
                  <li
                    key={link.label}
                    className="animate-menu-in"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <Link
                      href={link.href}
                      onClick={(event) => handleAnchorClick(event, link.href)}
                      className={cn(
                        "block w-full py-3 font-sans font-light text-4xl transition-colors hover:text-brand-red",
                        link.href === "/book" ? "text-white font-semibold" : "text-[#23212c]/90"
                      )}
                    >
                      {link.label}
                      <span className="mt-1 block h-px w-8 bg-brand-pink/60" />
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
          <p className="px-8 pb-10 font-sans text-[10px] uppercase tracking-label text-[#23212c]/50">
            {siteConfig.tagline}
          </p>
        </div
>
      ) : null}
    </header>
  );
}
