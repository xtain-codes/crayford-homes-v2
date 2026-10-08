import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/BrandLogo";
import { getEmailUrl, getPhoneUrl, navigationLinks, siteConfig } from "@/lib/site";
import { isPlaceholder } from "@/lib/utils";

export function Footer() {
  const socials = isPlaceholder(siteConfig.instagram)
    ? []
    : [{ label: "Instagram", href: siteConfig.instagram, icon: Instagram }];

  return (
    <footer className="bg-[#f7f0e1] text-[#23212c]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-20 lg:px-12">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand + logo */}
          <div className="md:col-span-5">
            <p className="flex items-center gap-3">
              <BrandLogo className="h-10 w-auto" />
              <span className="sr-only">Crayford Homes</span>
            </p>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-label text-[#23212c]/70">
              {siteConfig.tagline}
            </p>

            <ul className="mt-8 space-y-3 text-sm text-[#23212c]/85">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#23212c]/70" aria-hidden="true" />
                <span>{siteConfig.address}</span>
              </li>
              {getPhoneUrl() ? (
                <li>
                  <a
                    href={getPhoneUrl() ?? "#"}
                    className="flex items-center gap-3 transition-colors hover:text-brand-pink"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-[#23212c]/70" aria-hidden="true" />
                    {siteConfig.phone}
                  </a>
                </li>
              ) : null}
              {getEmailUrl() ? (
                <li>
                  <a
                    href={getEmailUrl() ?? "#"}
                    className="flex items-center gap-3 transition-colors hover:text-brand-pink"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[#23212c]/70" aria-hidden="true" />
                    {siteConfig.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4">
            <p className="font-sans text-[10px] uppercase tracking-label text-[#23212c]/60">
              Explore
            </p>
            <nav aria-label="Footer" className="mt-4">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-1">
                {[
                  ...navigationLinks,
                  { label: "Book Your Stay", href: "/book" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-[#23212c]/80 transition-colors hover:text-brand-red"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Official details */}
          <div className="md:col-span-3">
            <p className="font-sans text-[10px] uppercase tracking-label text-[#23212c]/60">
              Official
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#23212c]/80">
              <li>
                <a
                  href="https://www.crayfordhomes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-red"
                >
                  www.crayfordhomes.com
                </a>
              </li>
              <li className="text-[#23212c]/70">+234 706 608 5785</li>
              <li className="text-[#23212c]/70">BN: 9301211</li>
            </ul>

            {socials.length > 0 ? (
              <ul className="mt-6 flex items-center gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex h-10 w-10 items-center justify-center border border-[#23212c]/25 transition-colors hover:border-white hover:bg-white/10"
                    >
                      <social.icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[#23212c]/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#23212c]/70">© 2026 Crayford Homes. All rights reserved.</p>
          <Link
            href="/admin/login"
            className="font-sans text-[10px] uppercase tracking-label text-[#23212c]/50 transition-colors hover:text-brand-red"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
