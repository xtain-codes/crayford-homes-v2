"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EditorialAvailability } from "@/components/EditorialAvailability";
import { siteConfig } from "@/lib/site";
import type { ImageAvailability } from "@/lib/utils";

export function Hero({
  imageAvailability,
}: {
  imageAvailability: ImageAvailability;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroSrc, setHeroSrc] = useState("/images/hero-living-room.jpg");

  // Hide the hero image gracefully if it is missing from public/images.
  useEffect(() => {
    if (imageAvailability["/images/hero-living-room.jpg"] === false) {
      setHeroSrc("/images/og.svg");
    }
  }, [imageAvailability]);

  return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const parallax = Math.min(scrollY, 700);

  return (
    <section
      aria-label="Crayford Apartments introduction"
      className="relative overflow-visible bg-[#f7f0e1] pt-32 md:pt-40"
    >
      <div className="mx-auto w-full max-w-7xl px-6 pb-8 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#23212c]/60">
            Crayford Homes · Lagos, Nigeria
          </p>
          <h1 className="mt-6 font-sans text-[clamp(3rem,7vw,6.8rem)] font-light leading-[0.98] tracking-[-0.045em] text-[#23212c]">
            {siteConfig.heroHeadingLines.join(" ")}
          </h1>
          <p className="mt-7 max-w-xl font-sans text-base font-light leading-relaxed text-[#23212c]/75 md:text-lg">
            {siteConfig.heroSupportingText}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/apartment" className="inline-flex min-h-12 items-center rounded-full border border-[#23212c] px-6 text-sm font-medium text-[#23212c] transition-colors hover:bg-[#23212c] hover:text-white">
              Explore the apartment
            </Link>
            <Link href="/gallery" className="inline-flex min-h-12 items-center px-4 text-sm font-medium text-[#23212c] underline underline-offset-4">
              View the gallery
            </Link>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-5 gap-4 md:mt-16 md:gap-7">
          <div className="relative col-span-3 h-[290px] overflow-hidden rounded-[24px] bg-[#e7ddce] sm:h-[430px] md:h-[560px] md:rounded-[40px]">
            <Image src={heroSrc} alt="Crayford Homes living room" fill priority sizes="(max-width: 768px) 60vw, 60vw" className="object-cover" onLoad={() => setIsLoaded(true)} />
          </div>
          <div className="relative col-span-2 mt-12 h-[242px] overflow-hidden rounded-[24px] bg-[#e7ddce] sm:mt-20 sm:h-[350px] md:mt-28 md:h-[450px] md:rounded-[40px]">
            <Image src="/images/bedroom-1-main.jpg" alt="Comfortable bedroom at Crayford Homes" fill sizes="(max-width: 768px) 40vw, 40vw" className="object-cover" />
          </div>
        </div>
      </div>
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-8 sm:px-8 lg:px-12">
        <EditorialAvailability />
      </div>
    </section>
  );
}
