import { z } from "zod";

/** Shared validation schemas — used by both public and admin API routes. */

const dayKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (yyyy-mm-dd).");

export const createBookingSchema = z.object({
  apartmentSlug: z.string().min(1),
  guestName: z.string().trim().min(2, "Enter the guest's full name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().default(""),
  checkIn: dayKey,
  checkOut: dayKey,
  guests: z.coerce.number().int().min(1, "At least one guest.").max(20),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const verifyPaymentSchema = z.object({
  bookingReference: z.string().min(4).max(200),
  paymentReference: z.string().min(4).max(200),
});

export const blockDatesSchema = z.object({
  apartmentId: z.string().min(1),
  startDate: dayKey,
  endDate: dayKey,
  reason: z.string().trim().max(200).optional().default("Unavailable"),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(4000),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const updateBookingStatusSchema = z.object({
  bookingStatus: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
});

export const apartmentUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  location: z.string().trim().max(300),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  maxGuests: z.coerce.number().int().min(1).max(20),
  pricePerNight: z.coerce.number().int().min(0).max(10_000_000),
  checkInTime: z.string().trim().max(10),
  checkOutTime: z.string().trim().max(10),
  active: z.coerce.boolean(),
});

export const roomSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes."),
  name: z.string().trim().min(2).max(120),
  label: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  mainImage: z.string().trim().min(1).max(300),
  gallery: z.array(z.string().trim().min(1).max(300)).max(12),
  features: z.array(z.string().trim().min(1).max(120)).max(12),
  displayOrder: z.coerce.number().int().min(0).max(100),
});

export const amenitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300),
  icon: z.string().trim().min(1).max(60),
  displayOrder: z.coerce.number().int().min(0).max(100),
});

export const galleryImageSchema = z.object({
  src: z.string().trim().min(1).max(300),
  alt: z.string().trim().min(2).max(300),
  title: z.string().trim().min(2).max(120),
  featured: z.coerce.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().min(0).max(100),
});

export const settingsSchema = z.object({
  "site.name": z.string().trim().min(1).max(120),
  "site.wordmark": z.string().trim().min(1).max(60),
  "site.tagline": z.string().trim().max(200),
  "site.location": z.string().trim().max(300),
  "site.address": z.string().trim().max(300),
  "site.email": z.string().trim().email("Enter a valid email address."),
  "site.phone": z.string().trim().max(40),
  "site.instagram": z.string().trim().max(300),
  "announcement.message": z.string().trim().max(200),
  "announcement.status": z.string().trim().max(60),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});
