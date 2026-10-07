import fs from "fs";
import path from "path";

import { galleryImages, rooms, type GalleryImage, type ImageRef, type Room } from "@/lib/site";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

/** Cache of which files exist in public/images — read once per process. */
let existingFiles: Set<string> | null = null;

function getExistingImageFiles(): Set<string> {
  if (existingFiles) return existingFiles;
  existingFiles = new Set<string>();
  try {
    for (const file of fs.readdirSync(IMAGES_DIR)) {
      if (/\.(jpe?g|png|webp|avif)$/i.test(file)) {
        existingFiles.add(`/images/${file}`);
      }
    }
  } catch {
    // public/images missing — everything is treated as unavailable.
  }
  return existingFiles;
}

function imageExists(src: string): boolean {
  return getExistingImageFiles().has(src);
}

/** Filters a list of image refs down to those that actually exist on disk. */
export function filterAvailableImages<T extends ImageRef>(images: (T | null)[]): T[] {
  return images.filter((image): image is T => !!image && imageExists(image.src));
}

/** Rooms with their images filtered to files that exist in public/images. */
export function getAvailableRooms(): Room[] {
  return rooms
    .map((room) => {
      const main = room.main && imageExists(room.main.src) ? room.main : null;
      const gallery = room.gallery.filter((image) => imageExists(image.src));
      return { ...room, main, gallery };
    })
    .filter((room) => room.main || room.gallery.length > 0);
}

/** Gallery images that actually exist, ready to render. */
export function getAvailableGalleryImages(): GalleryImage[] {
  return galleryImages.filter((image) => imageExists(image.src));
}

/** Picks the first available image from a priority list, for cinematic breaks. */
export function getFirstAvailableImage(sources: string[]): ImageRef | null {
  for (const src of sources) {
    if (imageExists(src)) return { src, alt: "Crayford apartment" };
  }
  return null;
}
