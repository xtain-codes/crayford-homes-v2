import type { Metadata } from "next";

import { BookingWidget } from "@/components/BookingWidget";
import { formatNaira } from "@/lib/booking";
import { getBookableApartments } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Stay",
  description:
    "Choose your dates and book your Crayford apartment — thoughtfully designed stays, secured with Paystack.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const apartments = await getBookableApartments();

  return (
    <>
      <section className="relative min-h-[68vh] overflow-hidden bg-[#111111]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-living-room.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-7xl items-end px-6 pb-16 pt-36 sm:px-8 md:pb-20 md:pt-44 lg:px-12">
          <div className="max-w-3xl">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-white/65">
              Reservations · Crayford Homes
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-normal leading-[0.98] tracking-[-0.02em] text-[#fafafb] sm:text-6xl md:text-7xl">
              A quieter way to stay in Lagos.
            </h1>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 md:text-lg">
              {apartments[0]
                ? `${apartments[0].bedrooms} bedrooms, ${apartments[0].bathrooms} bathrooms, the whole apartment — ${formatNaira(apartments[0].pricePerNight)} per night.`
                : "Thoughtfully designed stays in Lagos."}{" "}
              Choose your dates, review your stay and pay securely.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Booking" className="bg-[#f7f0e1]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 sm:px-8 md:py-28 lg:px-12">
          <div className="mb-12 grid gap-6 border-b border-charcoal/15 pb-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Plan your stay
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] text-charcoal sm:text-5xl">
                Everything you need, nothing you don&apos;t.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Live availability, transparent pricing and secure Paystack checkout. Your selected dates are held while you complete payment.
            </p>
          </div>

          {apartments.length > 0 ? (
            <BookingWidget
              apartments={apartments.map((apartment) => ({
                slug: apartment.slug,
                name: apartment.name,
                bedrooms: apartment.bedrooms,
                bathrooms: apartment.bathrooms,
                maxGuests: apartment.maxGuests,
                pricePerNight: apartment.pricePerNight,
              }))}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
              Bookings are temporarily unavailable. Please check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

