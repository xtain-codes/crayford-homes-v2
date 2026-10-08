import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RoomTabs } from "@/components/RoomTabs";
import { Eyebrow, Reveal } from "@/components/ui/Reveal";
import { getPublicContent } from "@/lib/content";
import { getImageAvailability } from "@/lib/image-availability";

export const metadata: Metadata = {
  title: "The Apartment",
  description:
    "Designed for living, ready for staying. Explore every room at Crayford — living spaces, kitchen, bedrooms and bathrooms.",
};

export const dynamic = "force-dynamic";

export default async function ApartmentPage() {
  const content = await getPublicContent();
  const existing = new Set(Object.keys(getImageAvailability()));
  const rooms = content.rooms
    .map((room) => ({
      ...room,
      main: room.main && existing.has(room.main.src) ? room.main : null,
      gallery: room.gallery.filter((image) => existing.has(image.src)),
    }))
    .filter((room) => room.main || room.gallery.length > 0);

  return (
    <>
      {/* Cinematic page header */}
      <section className="relative flex min-h-[68svh] items-end overflow-hidden bg-[#f7f0e1]">
        <Image
          src="/images/hero-living-room.jpg"
          alt=""
          role="presentation"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#f7f0e1]/50"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 sm:px-8 lg:px-12">
          <Eyebrow className="text-[#23212c]/90">The Apartment</Eyebrow>
          <h1 className="mt-5 font-sans text-6xl font-light tracking-[-0.035em] text-[#23212c] sm:text-7xl md:text-8xl">
            THE APARTMENT
          </h1>
          <p className="mt-4 font-serif text-xl italic text-[#23212c]/80 sm:text-2xl">
            Designed for living. Ready for staying.
          </p>
        </div>
      </section>

      {/* Room explorer */}
      {rooms.length > 0 ? (
        <section aria-label="Explore the rooms" className="bg-[#f7f0e1] pt-16 md:pt-24">
          <RoomTabs rooms={rooms} />
        </section>
      ) : (
        <section className="bg-[#f7f0e1]">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
            <p className="text-muted">
              Room photography is being prepared — check back soon.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
