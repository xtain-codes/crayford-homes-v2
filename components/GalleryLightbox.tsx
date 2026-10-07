"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import type { GalleryImage } from "@/lib/site";

export function GalleryLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;

  const navigate = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onNavigate((index + delta + images.length) % images.length);
    },
    [index, images.length, onNavigate]
  );

  // Keyboard navigation: Escape closes, arrows move between images.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, navigate]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  const image = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${image.title} — image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[80] flex flex-col bg-warmblack/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-sans text-[10px] uppercase tracking-label text-cream/70">
          {image.title} — {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="inline-flex h-11 w-11 items-center justify-center text-cream transition-colors hover:text-brand-red"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex-1 touch-pan-y"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(delta) > 48) navigate(delta > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
      >
        <div key={image.src} className="animate-fade-in relative mx-auto h-full w-full max-w-6xl px-14 pb-4 sm:px-20">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-contain animate-fade-in"
            priority
          />
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/80 transition-all hover:scale-105 hover:text-brand-red sm:left-6"
            >
              <ChevronLeft className="h-9 w-9" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigate(+1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-cream/80 transition-all hover:scale-105 hover:text-brand-red sm:right-6"
            >
              <ChevronRight className="h-9 w-9" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
