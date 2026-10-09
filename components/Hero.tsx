"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { EditorialAvailability } from "@/components/EditorialAvailability";
import { siteConfig } from "@/lib/site";
import type { ImageAvailability } from "@/lib/utils";

export function Hero({ imageAvailability }: { imageAvailability: ImageAvailability }) {
  const heroImage = imageAvailability["/images/hero-living-room.jpg"] === false
    ? "/hero-living-room.jpg"
    : "/images/hero-living-room.jpg";

  return (
    <section aria-label="Crayford Homes introduction" className="relative isolate min-h-[780px] overflow-hidden bg-[#201a19] text-white">
      <div className="absolute inset-0 -z-20">
        <Image src={heroImage} alt="The elegant living room at Crayford Homes" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#130d0e]/85 via-[#1b1113]/55 to-[#1b1113]/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#130d0e]/70 via-transparent to-[#130d0e]/30" />

      <div className="mx-auto flex min-h-[780px] w-full max-w-7xl flex-col justify-center px-6 pb-40 pt-48 sm:px-8 md:min-h-[850px] md:pb-44 lg:px-12">
        <div className="max-w-4xl">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e9c4b3]">Premium apartments in Lagos</p>
          <h1 className="max-w-[850px] font-serif text-[clamp(3.8rem,8.5vw,8.2rem)] font-normal leading-[0.94] tracking-[-0.045em] text-white drop-shadow-lg">
            {siteConfig.heroHeadingLines.join(" ")}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">{siteConfig.heroSupportingText}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/apartment" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#e8c39f] px-7 text-sm font-medium text-[#241b1b] transition-colors hover:bg-white">
              Explore the apartments <span aria-hidden="true" className="ml-3">→</span>
            </Link>
            <Link href="/gallery" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/65 px-7 text-sm font-medium text-white transition-colors hover:bg-white/15">
              View the gallery
            </Link>
          </div>
        </div>
        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-6 text-white/90 sm:grid-cols-3 md:mt-20">
          <div className="flex items-center gap-3"><MapPin className="h-6 w-6 shrink-0 text-[#e8c39f]" /><span className="text-sm">Prime Lagos location</span></div>
          <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-[#e8c39f]" /><span className="text-sm">Secure and private</span></div>
          <div className="flex items-center gap-3"><Sparkles className="h-6 w-6 shrink-0 text-[#e8c39f]" /><span className="text-sm">Premium amenities</span></div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-7xl px-6 pb-5 sm:px-8 lg:px-12">
        <EditorialAvailability />
      </div>
    </section>
  );
}
