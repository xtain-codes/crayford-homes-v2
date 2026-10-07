import type { Metadata } from "next";

import { BookingWidget } from "@/components/BookingWidget";
import { Eyebrow } from "@/components/ui/Reveal";
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
      <section className="bg-warmblack">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-36 sm:px-8 md:pb-20 md:pt-44 lg:px-12">
          <Eyebrow className="text-cream/90">Reservations</Eyebrow>
          <h1 className="mt-5 font-serif text-5xl font-medium text-cream sm:text-6xl md:text-7xl">
            Your stay starts here.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/70 md:text-lg">
            {apartments[0]
              ? `${apartments[0].bedrooms} bedrooms, ${apartments[0].bathrooms} bathrooms, the whole apartment — ${formatNaira(apartments[0].pricePerNight)} per night.`
              : "Thoughtfully designed stays in Lagos."}{" "}
            Choose your dates and pay securely.
          </p>
        </div>
      </section>

      <section aria-label="Booking" className="bg-warmwhite">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-24 lg:px-12">
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
            <p className="border border-dashed border-charcoal/20 bg-white p-8 text-center text-sm text-muted">
              Bookings are temporarily unavailable. Please check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
