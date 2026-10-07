"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { EditorialAvailability } from "@/components/EditorialAvailability";
import { siteConfig } from "@/lib/site";
import type { ImageAvailability } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Hero({
  imageAvailability,
}: {
  imageAvailability: ImageAvailability;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroSrc, setHeroSrc] = useState("/images/hero-living-room.jpg");
  const sectionRef = useRef<HTMLElement | null>(null);

  // Hide the hero image gracefully if it is missing from public/images.
  useEffect(() => {
    if (imageAvailability["/images/hero-living-room.jpg"] === false) {
      setHeroSrc("/images/og.svg");
    }
  }, [imageAvailability]);

  // Subtle parallax while the hero is in view.
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 1.2) {
        setScrollY(window.scrollY);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = Math.min(scrollY, 700);

  return (
    <section
      ref={sectionRef}
      aria-label="Crayford Apartments introduction"
      className="relative flex min-h-[88svh] items-end overflow-visible bg-warmblack md:min-h-[94svh]"
    >
      {/* Background image with slow zoom + parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${parallax * 0.25}px, 0)` }}
      >
        <Image
          src={heroSrc}
          alt="The Crayford living room, bathed in warm natural light"
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover transition-all duration-[1400ms] ease-smooth",
            isLoaded ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
        />
        <div className="hero-vignette absolute inset-0" aria-hidden="true" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-7xl px-6 pb-32 pt-40 sm:px-8 md:pb-36 lg:px-12",
          "transition-all duration-1000 ease-smooth",
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <p
          className={cn(
            "eyebrow text-cream/90 transition-all duration-700",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          {siteConfig.name} Apartments
        </p>

        <h1 className="mt-6 max-w-4xl font-serif text-[13vw] font-medium leading-[0.92] tracking-[-0.035em] text-white sm:text-7xl md:text-[6.5rem]">
          {siteConfig.heroHeadingLines.map((line, index) => (
            <span
              key={line}
              className="block overflow-hidden"
              aria-hidden={index > 0 ? undefined : undefined}
            >
              <span
                className={cn(
                  "block transition-all duration-700 ease-smooth",
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                )}
                style={{ transitionDelay: `${150 + index * 130}ms` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          className={cn(
            "mt-8 max-w-xl text-balance text-base leading-relaxed text-cream/80 md:text-lg",
            "transition-all duration-700 ease-smooth",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
          style={{ transitionDelay: "600ms" }}
        >
          {siteConfig.heroSupportingText}
        </p>

        <div
          className={cn(
            "mt-10 flex flex-col gap-4 sm:flex-row sm:items-center",
            "transition-all duration-700 ease-smooth",
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
          style={{ transitionDelay: "750ms" }}
        >
          <Link href="/book" className="btn-primary">
            Book a Stay
          </Link>
          <a href="/apartment" className="btn-outline text-cream">
            Explore the Apartment
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <EditorialAvailability />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-1000 md:flex",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDelay: "1200ms" }}
      >
        <span className="font-sans text-[10px] uppercase tracking-label text-cream/70">
          Scroll to explore
        </span>
        <span className="relative h-10 w-px overflow-hidden bg-cream/25">
          <span className="absolute left-0 top-0 h-4 w-px animate-scroll-dot bg-brand-red" />
        </span>
      </div>
    </section>
  );
}
