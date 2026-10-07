import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Eyebrow, Reveal, SiteImage } from "@/components/ui/Reveal";
import { getAvailableRooms } from "@/lib/images";
import type { Room } from "@/lib/site";
import { cn } from "@/lib/utils";

export function ApartmentPreview() {
  const rooms = getAvailableRooms().slice(0, 5);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <section
      id="the-apartment"
      aria-labelledby="apartment-preview-heading"
      className="bg-warmwhite"
    >
      <div className="mx-auto max-w-7xl px-6 pb-28 sm:px-8 md:pb-40 lg:px-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal>
              <Eyebrow>The Apartment</Eyebrow>
              <h2
                id="apartment-preview-heading"
                className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.08] text-charcoal sm:text-5xl md:text-6xl"
              >
                Everything you need.
                <br />
                Nothing you don&rsquo;t.
              </h2>
            </Reveal>
          </div>
          <Reveal className="md:col-span-4 md:justify-self-end">
            <Link href="/apartment" className="group inline-flex items-center gap-2 text-sm font-medium text-charcoal">
              View every room
              <ArrowUpRight className="h-4 w-4 text-brand-red transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        {/* Staggered editorial room grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 md:mt-20 lg:grid-cols-12">
          {rooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const SPANS = [
  "col-span-2 row-span-2 lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "col-span-2 lg:col-span-6",
  "col-span-2 lg:col-span-6",
] as const;

function RoomCard({ room, index }: { room: Room; index: number }) {
  const image = room.main ?? room.gallery[0];
  if (!image) return null;

  return (
    <Reveal
      delay={(index % 3) * 100}
      className={cn(
        "group min-h-[240px] sm:min-h-[280px]",
        SPANS[index] ?? "col-span-2 lg:col-span-4"
      )}
    >
      <Link
        href={`/apartment?room=${room.id}`}
        className="group relative block h-full min-h-[inherit] w-full overflow-hidden bg-beige"
      >
        <SiteImage
          image={{ ...image, aspect: undefined }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
          hoverZoom
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-warmblack/70 via-warmblack/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-label text-cream/70">
              0{index + 1}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-cream sm:text-3xl">
              {room.name}
            </h3>
          </div>
          <span className="mb-1 hidden font-sans text-[10px] uppercase tracking-label text-cream/0 transition-all duration-500 group-hover:text-cream/90 sm:block">
            Explore room →
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
