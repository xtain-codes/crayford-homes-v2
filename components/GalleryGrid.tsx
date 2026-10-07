"use client";

import { useState } from "react";

import { GalleryLightbox } from "@/components/GalleryLightbox";
import { Eyebrow, Reveal, SiteImage } from "@/components/ui/Reveal";
import type { GalleryImage } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Editorial masonry-style layout (CSS columns) used by the gallery page and preview. */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.src}
            onClick={() => setLightboxIndex(index)}
            className="group mb-3 block w-full break-inside-avoid text-left sm:mb-4"
            aria-label={`View ${image.title} image`}
          >
            <span className="block overflow-hidden bg-beige">
              <span
                className={cn(
                  "block",
                  // Varied editorial aspect ratios for the masonry rhythm.
                  index % 5 === 0 ? "aspect-[3/4]" : index % 5 === 1 ? "aspect-[4/3]" :
                  index % 5 === 2 ? "aspect-[1/1]" : index % 5 === 3 ? "aspect-[4/5]" : "aspect-[3/4]"
                )}
              >
                <SiteImage image={image} sizes="(max-width: 768px) 50vw, 25vw" hoverZoom />
              </span>
            </span>
            <span className="mt-3 flex items-center justify-between font-sans text-[10px] uppercase tracking-label text-muted">
              {image.title}
              <span className="h-px w-6 bg-brand-red/0 transition-all duration-300 group-hover:bg-brand-red" aria-hidden="true" />
            </span>
            <span className="sr-only">Open image viewer</span>
          </button>
        ))}
      </div>

      <GalleryLightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
