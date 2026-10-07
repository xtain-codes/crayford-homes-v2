export type { Amenity, GalleryImage, ImageRef, Room } from "@/lib/site";

export type SectionLabel = {
  label: string;
  heading: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string | null;
  icon: string;
};
