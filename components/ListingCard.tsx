"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";

import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import { formatNaira } from "@/lib/booking";

export type ListingStats = {
  apartments: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  pricePerNight: number;
};

export function ListingCard({ stats }: { stats: ListingStats }) {

  return (
    <section id="book" aria-labelledby="listing-heading" className="bg-[#f7f0e1]">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-36 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow center>Reservations</Eyebrow>
          <h2
            id="listing-heading"
            className="mt-5 text-balance font-sans text-4xl font-light tracking-[-0.035em] leading-[1.08] text-charcoal sm:text-5xl md:text-6xl"
          >
            Your stay starts here.
          </h2>
        </Reveal>

        <Reveal delay={150} className="mt-14 md:mt-20">
          <div className="mx-auto max-w-4xl overflow-hidden border border-charcoal/10 bg-cream shadow-none rounded-[24px]">
            <div className="grid md:grid-cols-5">
              {/* Left: details */}
              <div className="p-8 sm:p-12 md:col-span-3">
                <p className="font-sans text-3xl font-light tracking-[-0.035em] tracking-[0.28em] text-charcoal">
                  CRAYFORD
                </p>
                <p className="mt-2 font-sans text-[11px] uppercase tracking-label text-muted">
                  {stats.apartments} apartments · {stats.bedrooms} bedrooms each
                </p>

                <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8">
                  <div>
                    <dt className="font-sans text-[10px] uppercase tracking-label text-muted">
                      Apartments
                    </dt>
                    <dd className="mt-2 font-serif text-xl text-charcoal">
                      {stats.apartments}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[10px] uppercase tracking-label text-muted">
                      Bedrooms each
                    </dt>
                    <dd className="mt-2 font-serif text-xl text-charcoal">
                      {stats.bedrooms}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[10px] uppercase tracking-label text-muted">
                      Bathrooms each
                    </dt>
                    <dd className="mt-2 font-serif text-xl text-charcoal">
                      {stats.bathrooms}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[10px] uppercase tracking-label text-muted">
                      Guests each
                    </dt>
                    <dd className="mt-2 font-serif text-xl text-charcoal">
                      up to {stats.guests}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Right: price + booking CTA */}
              <div className="flex flex-col justify-between bg-charcoal p-8 text-cream sm:p-12 md:col-span-2">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-label text-cream/60">
                    Nightly rate
                  </p>
                  <p className="mt-3 font-serif text-4xl text-cream">
                    {formatNaira(stats.pricePerNight)}
                  </p>
                  <p className="mt-2 text-sm text-cream/60">per night, whole apartment</p>
                </div>

                <div className="mt-10 space-y-3">
                  <Link href="/book" className="btn-light w-full">
                    Book a Stay
                  </Link>
                  <Link href="/book" className="btn-outline w-full text-cream">
                    Check Availability
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-charcoal/10 bg-beige/40 px-8 py-4 sm:px-12">
              <CalendarCheck className="h-4 w-4 text-brand-red" aria-hidden="true" />
              <p className="text-xs text-muted">
                Instant online booking — pay securely with Paystack.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
