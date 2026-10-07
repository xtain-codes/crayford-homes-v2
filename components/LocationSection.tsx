"use client";

import { Compass, MapPin } from "lucide-react";
import Link from "next/link";

import { Eyebrow, Reveal, SiteImage } from "@/components/ui/Reveal";
import { getDirectionsUrl, siteConfig, type ImageRef } from "@/lib/site";
import { isPlaceholder } from "@/lib/utils";

export function LocationSection({
  variant = "section",
  mapImage = null,
}: {
  variant?: "section" | "page";
  /** First available gallery image, passed in from a server component. */
  mapImage?: ImageRef | null;
}) {
  const directionsUrl = getDirectionsUrl();

  return (
    <section
      aria-labelledby="location-heading"
      className={variant === "page" ? "bg-warmwhite pt-36 md:pt-44" : "bg-warmwhite"}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-36 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Address + CTAs */}
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Location</Eyebrow>
              <h2
                id="location-heading"
                className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.08] text-charcoal sm:text-5xl md:text-6xl"
              >
                {variant === "page" ? "Find your way to Crayford." : "Set in Lagos."}
              </h2>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
                Exact directions are shared with confirmed guests. Here is the
                general area — full address on booking.
              </p>
              <p className="mt-6 flex items-start gap-3 font-serif text-xl text-charcoal">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-red" aria-hidden="true" />
                <span>{siteConfig.address}</span>
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Get Directions
                  </a>
                ) : (
                  <Link href="/location" className="btn-primary">
                    Get Directions
                  </Link>
                )}
                <Link href="/gallery" className="btn-outline text-charcoal">
                  View the Gallery
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Map / image placeholder */}
          <Reveal delay={150} className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-charcoal/10 bg-cream lg:aspect-[16/10]">
              {mapImage ? (
                <SiteImageWrapper image={mapImage} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-sans text-[10px] uppercase tracking-label text-muted">
                    Map coming soon
                  </p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 flex items-center gap-2 bg-warmblack px-5 py-3 text-cream">
                <Compass className="h-4 w-4 text-brand-red" aria-hidden="true" />
                <span className="font-sans text-[10px] uppercase tracking-label">
                  Crayford — {siteConfig.location}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SiteImageWrapper({ image }: { image: ImageRef }) {
  return <SiteImage image={image} sizes="(max-width: 1024px) 100vw, 58vw" />;
}
