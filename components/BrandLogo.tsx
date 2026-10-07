"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Official Crayford Homes logo.
 *
 * Drop the client-provided logo file at public/images/crayford-logo.png and it
 * is used everywhere (nav, footer, admin, intro, favicon hook) unchanged — no
 * component edits needed. Until the file is added, a typographic wordmark in
 * the brand style is rendered instead so nothing ever shows a broken image.
 */
export function BrandLogo({
  className = "h-9 w-auto",
  light = false,
  priority = false,
}: {
  className?: string;
  /** Wordmark tint used only while the logo asset is not yet present. */
  light?: boolean;
  priority?: boolean;
}) {
  const [logoExists, setLogoExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/images/crayford-logo.png", { method: "HEAD" })
      .then((response) => {
        if (!cancelled) setLogoExists(response.ok);
      })
      .catch(() => {
        if (!cancelled) setLogoExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (logoExists) {
    return (
      <Image
        src="/images/crayford-logo.png"
        alt="Crayford Homes"
        width={176}
        height={44}
        priority={priority}
        className={className}
      />
    );
  }

  if (logoExists === null) {
    // Unknown yet — reserve space to avoid layout shift once resolved.
    return <span className={className} aria-hidden="true" />;
  }

  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-serif font-semibold tracking-[0.28em] ${
        light ? "text-white" : "text-ink"
      } ${className}`}
    >
      CRAYFORD
      <span className={`ml-2 font-sans text-[0.42em] font-medium tracking-[0.35em] ${light ? "text-brand-pink" : "text-brand-red"}`}>
        HOMES
      </span>
    </span>
  );
}

/**
 * First-visit logo intro — a quick, elegant brand reveal (~1.8s total).
 *
 * Session-based: shows once per browser session (sessionStorage), never on
 * internal navigation, never repeated on refresh within the session. The
 * homepage renders underneath the whole time, so nothing is delayed; the
 * overlay simply fades away. Reduced-motion users skip the logo animation
 * (the global CSS override collapses all durations, so the overlay flashes
 * by in ~0ms and the page appears immediately).
 */
export function BrandIntro() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("crayford-intro") === "1";
    } catch {
      // Storage unavailable (private mode etc.) — still show once per mount.
    }
    if (!seen) {
      setShow(true);
      try {
        window.sessionStorage.setItem("crayford-intro", "1");
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (show === null || !show) return null;

  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro__logo">
        <BrandLogo className="h-14 w-auto sm:h-16" priority />
      </div>
    </div>
  );
}
