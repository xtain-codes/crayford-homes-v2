"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect as nextRedirect } from "next/navigation";

import {
  findConfirmedOverlap,
  isRangeAvailable,
  parseDayKey,
} from "@/lib/availability";
import { getSession, sessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  amenitySchema,
  apartmentUpdateSchema,
  blockDatesSchema,
  galleryImageSchema,
  inquiryStatusSchema,
  roomSchema,
  settingsSchema,
  updateBookingStatusSchema,
} from "@/lib/validations";

/**
 * Admin server actions.
 *
 * Every action re-validates the admin session server-side before touching
 * the database — hiding buttons in the UI is never the security boundary.
 * All input goes through the zod schemas in lib/validations.ts.
 */

type ActionState = { ok: boolean; message: string } | null;

/* Sign-in lives in app/api/admin/login/route.ts — a Route Handler sets the
   session cookie deterministically. Server actions below handle mutations. */

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookie.name);
  nextRedirect("/admin/login");
}

/* ──────────────────── Availability: block / unblock ───────────────────── */

export async function blockDatesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const parsed = blockDatesSchema.safeParse({
    apartmentId: formData.get("apartmentId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || "Unavailable",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the dates." };
  }
  const { apartmentId, startDate, endDate, reason } = parsed.data;

  const start = parseDayKey(startDate);
  const end = parseDayKey(endDate);
  if (!start || !end) {
    return { ok: false, message: "Use valid dates." };
  }
  if (end.getTime() <= start.getTime()) {
    return { ok: false, message: "The end date must be after the start date." };
  }

  // Refuse to block over a CONFIRMED booking — real guests always win.
  const overlap = await findConfirmedOverlap(apartmentId, start, end);
  if (overlap) {
    return {
      ok: false,
      message: `Cannot block — a confirmed booking (${overlap.reference}) overlaps these dates.`,
    };
  }

  await prisma.blockedDate.create({
    data: { apartmentId, startDate: start, endDate: end, reason },
  });

  revalidatePath("/admin/availability");
  revalidatePath("/admin");
  revalidatePath("/book");
  return { ok: true, message: "Dates blocked successfully." };
}

export async function unblockDateAction(payload: { blockId: string }): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const block = await prisma.blockedDate.findUnique({ where: { id: payload.blockId } });
  if (!block) return { ok: false, message: "This block no longer exists." };

  await prisma.blockedDate.delete({ where: { id: payload.blockId } });

  revalidatePath("/admin/availability");
  revalidatePath("/admin");
  revalidatePath("/book");
  return { ok: true, message: "Dates are now available." };
}

export async function updateBlockReasonAction(payload: {
  blockId: string;
  reason: string;
}): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const reason = payload.reason.trim().slice(0, 200) || "Unavailable";
  await prisma.blockedDate.update({ where: { id: payload.blockId }, data: { reason } });
  revalidatePath("/admin/availability");
  return { ok: true, message: "Block updated." };
}

/* ─────────────────────────── Bookings ─────────────────────────────────── */

export async function updateBookingStatusAction(payload: {
  bookingId: string;
  bookingStatus: string;
}): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const parsed = updateBookingStatusSchema.safeParse({
    bookingStatus: payload.bookingStatus,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid status." };
  }
  const bookingStatus = parsed.data.bookingStatus;

  const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId } });
  if (!booking) return { ok: false, message: "Booking not found." };

  // A confirmed booking must never overlap another confirmed booking.
  if (bookingStatus === "confirmed") {
    const overlap = await findConfirmedOverlap(
      booking.apartmentId,
      booking.checkIn,
      booking.checkOut,
      booking.id
    );
    if (overlap) {
      return {
        ok: false,
        message: `Cannot confirm — overlaps confirmed booking ${overlap.reference}.`,
      };
    }
  }

  const paymentStatus =
    bookingStatus === "completed"
      ? "paid"
      : bookingStatus === "cancelled"
        ? booking.paymentStatus === "paid"
          ? "refunded"
          : "failed"
        : booking.paymentStatus;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { bookingStatus, paymentStatus, holdExpiresAt: null },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/availability");
  revalidatePath("/admin");
  revalidatePath("/book");
  return { ok: true, message: `Booking ${bookingStatus === "cancelled" ? "cancelled" : bookingStatus} successfully.` };
}

/* ─────────────────────────── Apartment ────────────────────────────────── */

export async function updateApartmentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const apartmentId = String(formData.get("apartmentId") ?? "");
  if (!apartmentId) return { ok: false, message: "Missing apartment." };

  const parsed = apartmentUpdateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    location: formData.get("location"),
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    maxGuests: formData.get("maxGuests"),
    pricePerNight: formData.get("pricePerNight"),
    checkInTime: formData.get("checkInTime"),
    checkOutTime: formData.get("checkOutTime"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.apartment.update({ where: { id: apartmentId }, data: parsed.data });

  revalidatePath("/admin/apartment");
  revalidatePath("/");
  revalidatePath("/book");
  return { ok: true, message: "Apartment updated — the website now shows the new details." };
}

/* ─────────────────────────── Rooms ────────────────────────────────────── */

export async function saveRoomAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const id = String(formData.get("id") ?? "");
  const parsed = roomSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    label: String(formData.get("name") ?? "").toUpperCase(),
    description: formData.get("description"),
    mainImage: formData.get("mainImage"),
    gallery: JSON.parse(String(formData.get("gallery") ?? "[]")),
    features: String(formData.get("features") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12),
    displayOrder: formData.get("displayOrder"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { gallery, features, ...data } = parsed.data;

  const payload = {
    ...data,
    galleryJson: JSON.stringify(gallery),
    featuresJson: JSON.stringify(features),
  };

  if (id) {
    await prisma.room.update({ where: { id }, data: payload });
  } else {
    await prisma.room.create({ data: payload });
  }

  revalidatePath("/admin/rooms");
  revalidatePath("/apartment");
  revalidatePath("/");
  return { ok: true, message: "Room saved." };
}

export async function deleteRoomAction(payload: { id: string }): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  await prisma.room.delete({ where: { id: payload.id } });
  revalidatePath("/admin/rooms");
  revalidatePath("/apartment");
  revalidatePath("/");
  return { ok: true, message: "Room removed." };
}

/* ─────────────────────────── Amenities ────────────────────────────────── */

export async function saveAmenityAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const id = String(formData.get("id") ?? "");
  const parsed = amenitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    displayOrder: formData.get("displayOrder"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  if (id) {
    await prisma.amenity.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.amenity.create({ data: parsed.data });
  }

  revalidatePath("/admin/amenities");
  revalidatePath("/");
  return { ok: true, message: "Amenity saved." };
}

export async function deleteAmenityAction(payload: { id: string }): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  await prisma.amenity.delete({ where: { id: payload.id } });
  revalidatePath("/admin/amenities");
  revalidatePath("/");
  return { ok: true, message: "Amenity removed." };
}

/* ─────────────────────────── Gallery ──────────────────────────────────── */

export async function saveGalleryImageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const id = String(formData.get("id") ?? "");
  const parsed = galleryImageSchema.safeParse({
    src: formData.get("src"),
    alt: formData.get("alt"),
    title: formData.get("title"),
    featured: formData.get("featured") === "on",
    displayOrder: formData.get("displayOrder"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  if (parsed.data.featured) {
    // Only one featured image at a time.
    await prisma.galleryImage.updateMany({ data: { featured: false } });
  }

  if (id) {
    await prisma.galleryImage.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.galleryImage.create({ data: parsed.data });
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { ok: true, message: "Gallery image saved." };
}

export async function deleteGalleryImageAction(payload: { id: string }): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  await prisma.galleryImage.delete({ where: { id: payload.id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { ok: true, message: "Image removed from the gallery." };
}

/* ─────────────────────────── Inquiries ────────────────────────────────── */

export async function updateInquiryStatusAction(payload: {
  id: string;
  status: string;
}): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const parsed = inquiryStatusSchema.safeParse({ status: payload.status });
  if (!parsed.success) return { ok: false, message: "Invalid status." };

  await prisma.inquiry.update({ where: { id: payload.id }, data: { status: parsed.data.status } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
  return { ok: true, message: "Inquiry updated." };
}

/* ─────────────────────────── Settings ─────────────────────────────────── */

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Authentication required." };

  const parsed = settingsSchema.safeParse({
    "site.name": formData.get("site.name"),
    "site.wordmark": formData.get("site.wordmark"),
    "site.tagline": formData.get("site.tagline"),
    "site.location": formData.get("site.location"),
    "site.address": formData.get("site.address"),
    "site.email": formData.get("site.email"),
    "site.phone": formData.get("site.phone"),
    "site.instagram": formData.get("site.instagram"),
    "announcement.message": formData.get("announcement.message"),
    "announcement.status": formData.get("announcement.status"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true, message: "Settings saved — the website is updated." };
}
