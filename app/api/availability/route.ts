import { NextResponse } from "next/server";

import { getAvailability, isBookableStatus } from "@/lib/availability";
import { getBookableApartments } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?apartment=<slug>&months=<n>
 * Returns the apartment list plus the set of unavailable dates (confirmed
 * bookings ∪ admin blocks) for the next `months` months. Consumed by the
 * public booking calendar to disable dates in the date pickers.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const apartmentSlug = url.searchParams.get("apartment");
  const months = Math.min(Math.max(Number(url.searchParams.get("months") ?? 6), 1), 24);

  try {
    const apartments = await getBookableApartments();
    const apartment =
      apartments.find((apartment) => apartment.slug === apartmentSlug) ?? apartments[0];

    if (!apartment) {
      return NextResponse.json({ error: "No apartments available." }, { status: 404 });
    }

    const snapshot = await getAvailability(apartment.id, { days: months * 31 });
    const unavailable = snapshot.days
      .filter((day) => !isBookableStatus(day.status))
      .map((day) => day.date);

    return NextResponse.json({
      apartmentSlug: apartment.slug,
      apartments: apartments.map((apartment) => ({
        slug: apartment.slug,
        name: apartment.name,
        maxGuests: apartment.maxGuests,
        pricePerNight: apartment.pricePerNight,
      })),
      unavailableDates: unavailable,
    });
  } catch (error) {
    console.error("GET /api/availability failed:", error);
    return NextResponse.json({ error: "Unable to load availability." }, { status: 500 });
  }
}
