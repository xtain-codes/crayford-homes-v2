import { prisma } from "@/lib/prisma";
import type { Amenity, GalleryImage, ImageRef, Room } from "@/lib/site";
import {
  amenities as staticAmenities,
  galleryImages as staticGallery,
  rooms as staticRooms,
  siteConfig,
} from "@/lib/site";

/**
 * Public content layer.
 *
 * Everything the public website renders (settings, apartments, rooms,
 * amenities, gallery) is read from the database so the admin dashboard
 * edits appear live. If the database is unreachable (e.g. a cold build
 * without DATABASE_URL), every getter falls back to the static config in
 * lib/site.ts so the site never breaks.
 */

export type PublicApartment = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  checkInTime: string;
  checkOutTime: string;
  active: boolean;
};

export type PublicContent = {
  settings: Record<string, string>;
  apartments: PublicApartment[];
  rooms: Room[];
  amenities: Amenity[];
  gallery: GalleryImage[];
};

/** Settings with sensible defaults merged over whatever is in the DB. */
function mergeSettings(db: Record<string, string>): Record<string, string> {
  return {
    "site.name": siteConfig.name,
    "site.wordmark": siteConfig.wordmark,
    "site.tagline": siteConfig.tagline,
    "site.location": siteConfig.location,
    "site.address": siteConfig.address,
    "site.email": siteConfig.email,
    "site.phone": siteConfig.phone,
    "site.instagram": siteConfig.instagram,
    "site.pricePerNight": String(siteConfig.pricePerNight),
    "announcement.message": siteConfig.announcement.message,
    "announcement.status": siteConfig.announcement.status,
    "booking.notes": "",
    ...db,
  };
}

function setting(settings: Record<string, string>, key: string): string {
  return settings[key] ?? "";
}

function roomFromDb(row: {
  slug: string;
  name: string;
  label: string;
  description: string;
  mainImage: string;
  galleryJson: string;
  featuresJson: string;
}): Room {
  let galleryPaths: string[] = [];
  let features: string[] = [];
  try {
    galleryPaths = JSON.parse(row.galleryJson) as string[];
  } catch {
    /* keep empty */
  }
  try {
    features = JSON.parse(row.featuresJson) as string[];
  } catch {
    /* keep empty */
  }
  const main: ImageRef | null = row.mainImage
    ? { src: row.mainImage, alt: `${row.name} at Crayford`, aspect: "aspect-[16/10]" }
    : null;
  return {
    id: row.slug,
    name: row.name,
    label: row.label,
    description: row.description,
    main,
    gallery: galleryPaths.map((src) => ({ src, alt: `${row.name} — detail`, aspect: "aspect-[4/3]" })),
    features: features.length > 0 ? features : undefined,
  };
}

function galleryFromDb(
  rows: { src: string; alt: string; title: string }[]
): GalleryImage[] {
  return rows.map((row) => ({
    src: row.src,
    alt: row.alt,
    aspect: "aspect-[4/3]",
    title: row.title,
  }));
}

function fallbackContent(): PublicContent {
  return {
    settings: mergeSettings({}),
    apartments: siteConfig.apartments.map((apartment, index) => ({
      id: apartment.id,
      slug: apartment.id,
      name: apartment.name,
      description: "",
      location: siteConfig.location,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      maxGuests: apartment.guests,
      pricePerNight: siteConfig.pricePerNight,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      active: true,
      displayOrder: index,
    })),
    rooms: staticRooms,
    amenities: staticAmenities,
    gallery: staticGallery,
  };
}

/** Loads all public content in one go — one DB round-trip per page render. */
export async function getPublicContent(): Promise<PublicContent> {
  try {
    const [settingRows, apartmentRows, roomRows, amenityRows, galleryRows] =
      await prisma.$transaction([
        prisma.siteSetting.findMany(),
        prisma.apartment.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }),
        prisma.room.findMany({ orderBy: { displayOrder: "asc" } }),
        prisma.amenity.findMany({ orderBy: { displayOrder: "asc" } }),
        prisma.galleryImage.findMany({ orderBy: { displayOrder: "asc" } }),
      ]);

    const settings = mergeSettings(
      Object.fromEntries(settingRows.map((row) => [row.key, row.value]))
    );

    const apartments: (PublicApartment & { displayOrder: number })[] = apartmentRows.map(
      (row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        location: row.location || setting(settings, "site.location"),
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        maxGuests: row.maxGuests,
        pricePerNight: row.pricePerNight,
        checkInTime: row.checkInTime,
        checkOutTime: row.checkOutTime,
        active: row.active,
        displayOrder: row.displayOrder,
      })
    );

    return {
      settings,
      apartments,
      rooms: roomRows.map(roomFromDb),
      amenities: amenityRows.map((row) => ({
        name: row.name,
        description: row.description,
        icon: row.icon,
      })),
      gallery: galleryFromDb(galleryRows),
    };
  } catch {
    return fallbackContent();
  }
}

/** Apartments available for booking, with static fallback. */
export async function getBookableApartments(): Promise<PublicApartment[]> {
  const content = await getPublicContent();
  return content.apartments.filter((apartment) => apartment.active);
}

/** Featured apartment — first active one — used by the homepage listing card. */
export async function getFeaturedApartment(): Promise<PublicApartment | null> {
  const apartments = await getBookableApartments();
  return apartments[0] ?? null;
}
