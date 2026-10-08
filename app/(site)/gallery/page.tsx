import type { Metadata } from "next";
import Image from "next/image";

import { GalleryGrid } from "@/components/GalleryGrid";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import { getPublicContent } from "@/lib/content";
import { getImageAvailability } from "@/lib/image-availability";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse the Crayford gallery — living spaces, kitchen, bedrooms and bathrooms, photographed in natural light.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const content = await getPublicContent();
  const existing = new Set(Object.keys(getImageAvailability()));
  const images = content.gallery.filter((image) => existing.has(image.src));

  return (
    <>
      <section className="bg-[#f7f0e1]">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-36 sm:px-8 md:pb-20 md:pt-44 lg:px-12">
          <Eyebrow className="text-[#23212c]/90">Gallery</Eyebrow>
          <h1 className="mt-5 font-sans text-5xl font-light tracking-[-0.035em] text-[#23212c] sm:text-6xl md:text-7xl">
            The gallery.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#23212c]/70 md:text-lg">
            Every corner of Crayford, photographed in natural light.
          </p>
        </div>
      </section>

      <section aria-label="Apartment gallery" className="bg-[#f7f0e1]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-24 lg:px-12">
          {images.length > 0 ? (
            <Reveal>
              <GalleryGrid images={images} />
            </Reveal>
          ) : (
            <p className="text-muted">
              Photography is on its way — the gallery will be published shortly.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
