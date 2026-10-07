"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ImageRef } from "@/lib/site";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before the reveal plays. */
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure";
};

/**
 * Fades content up into view once it enters the viewport.
 * Uses an IntersectionObserver (no animation library needed).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: tagName = "div",
}: RevealProps) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  // Compile-time cast only: the ref callback merely stores the node for the
  // IntersectionObserver, so the concrete element type at runtime is irrelevant.
  const Tag = tagName as "div";

  return (
    <Tag
      ref={setRef}
      className={cn(
        "transition-all duration-700 ease-smooth",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Small uppercase label with a brand rule, optionally centered. */
export function Eyebrow({
  children,
  className,
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <span className={cn("eyebrow", center && "eyebrow--center", className)}>
      {children}
    </span>
  );
}

type SiteImageProps = {
  image: ImageRef;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Optional scale on hover applied to the img. */
  hoverZoom?: boolean;
  fillOverlay?: boolean;
};

/** Editorial <Image> wrapper: fills its frame, object-cover, optional hover zoom. */
export function SiteImage({
  image,
  className,
  sizes = "100vw",
  priority = false,
  hoverZoom = false,
  fillOverlay = false,
}: SiteImageProps) {
  return (
    <div className={cn("image-frame h-full w-full", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover transition-transform duration-700 ease-smooth",
          hoverZoom && "group-hover:scale-[1.05]"
        )}
      />
      {fillOverlay ? <div className="absolute inset-0 bg-warmblack/20" /> : null}
    </div
>
  );
}
