"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import type { ImageAvailability } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PRIORITY = ["/images/exterior.jpg", "/images/hero-living-room.jpg", "/images/living-room-2.jpg"];

export function ImageBreak({ imageAvailability }: { imageAvailability: ImageAvailability }) {
  const src = PRIORITY.find((candidate) => imageAvailability[candidate] === true);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src) return null;

  return (
    <section aria-label="Stay in comfort" className="relative overflow-hidden bg-warmblack">
      <div className="relative h-[60vh] min-h-[420px] w-full md:h-[72vh]">
        <Image
          src={src}
          alt="Cinematic view of the Crayford apartment"
          fill
          sizes="100vw"
          className={cn(
            "object-cover transition-all duration-[1200ms] ease-smooth",
            isLoaded ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-warmblack/75 via-warmblack/35 to-transparent"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="max-w-xl animate-fade-up">
              <p className="eyebrow text-cream/80">The Crayford Feeling</p>
              <h2 className="mt-5 font-serif text-5xl font-medium text-cream sm:text-6xl md:text-7xl">
                STAY IN COMFORT.
              </h2>
              <Link href="/apartment" className="btn-outline mt-10 inline-flex text-cream">
                Explore Crayford
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
