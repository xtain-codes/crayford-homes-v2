import type { ImageRef } from "@/lib/site";

/** Which images on disk are available to the browser. */
export type ImageAvailability = Record<string, boolean>;

/** Joins non-empty CSS class fragments. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** True when a config value is still a marked placeholder like [X], [PRICE] or [LOCATION PLACEHOLDER]. */
export function isPlaceholder(value: string): boolean {
  return /\[[^\]\n]+\]/.test(value);
}

/** Returns the image only if it is marked available on the client. */
export function useAvailableImage(
  availability: ImageAvailability,
  image: ImageRef | null | undefined
): ImageRef | null {
  if (!image) return null;
  return availability[image.src] ? image : null;
}
