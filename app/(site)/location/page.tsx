import type { Metadata } from "next";

import { LocationSection } from "@/components/LocationSection";
import { getFirstAvailableImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Location",
  description:
    "Where to find Crayford. Directions and area information are shared with confirmed guests.",
};

export default function LocationPage() {
  const mapImage = getFirstAvailableImage([
    "/images/exterior.jpg",
    "/images/hero-living-room.jpg",
  ]);

  return (
    <section aria-label="Location" className="bg-warmwhite">
      <LocationSection variant="page" mapImage={mapImage} />
    </section>
  );
}
