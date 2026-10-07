import Link from "next/link";

import { About } from "@/components/About";
import { Amenities } from "@/components/Amenities";
import { ApartmentPreview } from "@/components/ApartmentPreview";
import { BookingCTA } from "@/components/BookingCTA";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Hero } from "@/components/Hero";
import { ImageBreak } from "@/components/ImageBreak";
import { ListingCard } from "@/components/ListingCard";
import { LocationSection } from "@/components/LocationSection";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import { getPublicContent } from "@/lib/content";
import { getAvailableGalleryImages } from "@/lib/images";
import { getImageAvailability } from "@/lib/image-availability";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [imageAvailability, content] = await Promise.all([
    Promise.resolve(getImageAvailability()),
    getPublicContent(),
  ]);
  // Gallery entries whose file is missing from public/images are hidden.
  const existing = new Set(Object.keys(imageAvailability));
  const galleryImages = content.gallery.filter((image) => existing.has(image.src));

  return (
    <>
      <Hero imageAvailability={imageAvailability} />
      <About />
      <ApartmentPreview />
      <Amenities amenities={content.amenities} />
      <ImageBreak imageAvailability={imageAvailability} />

      {/* Gallery preview */}
      <section aria-labelledby="gallery-preview-heading" className="bg-warmwhite">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 md:py-36 lg:px-12">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <Reveal>
                <Eyebrow>Gallery</Eyebrow>
                <h2
                  id="gallery-preview-heading"
                  className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.08] text-charcoal sm:text-5xl md:text-6xl"
                >
                  A look inside.
                </h2>
              </Reveal>
            </div>
            <Reveal className="md:col-span-4 md:justify-self-end">
              <Link
                href="/gallery"
                className="text-sm font-medium text-charcoal underline decoration-brand-red underline-offset-8 transition-colors hover:text-brand-red"
              >
                View the full gallery
              </Link>
            </Reveal>
          </div>
          <Reveal delay={120} className="mt-14 md:mt-20">
            <GalleryGrid images={galleryImages.slice(0, 8)} />
          </Reveal>
        </div>
      </section>

      <ListingCard
        stats={{
          apartments: content.apartments.length,
          bedrooms: content.apartments[0]?.bedrooms ?? 2,
          bathrooms: content.apartments[0]?.bathrooms ?? 2,
          guests: content.apartments[0]?.maxGuests ?? 5,
          pricePerNight: content.apartments[0]?.pricePerNight ?? 80000,
        }}
      />
      <LocationSection mapImage={galleryImages[0] ?? null} />
      <BookingCTA />
    </>
  );
}
