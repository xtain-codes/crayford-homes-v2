import fs from "fs";
import path from "path";

/**
 * Scans public/images at build/request time and returns a plain map of
 * image path → exists, which is safe to pass into client components
 * (unlike fs-based helpers).
 */
export function getImageAvailability(): Record<string, boolean> {
  const dir = path.join(process.cwd(), "public", "images");
  const availability: Record<string, boolean> = {};
  try {
    for (const file of fs.readdirSync(dir)) {
      if (/\.(jpe?g|png|webp|avif|svg)$/i.test(file)) {
        availability[`/images/${file}`] = true;
      }
    }
  } catch {
    // public/images does not exist — all images treated as unavailable.
  }
  return availability;
}
