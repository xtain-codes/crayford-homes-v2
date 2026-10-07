import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed: creates the admin user + copies the current content of lib/site.ts
// into the database so the public site and admin start in sync.

const prisma = new PrismaClient();

const rooms = [
  {
    slug: "living-room",
    name: "Living Room",
    label: "LIVING ROOM",
    description:
      "The heart of the apartment. Generous seating, soft natural light and a calm palette — a space that works equally well for slow mornings and easy evenings.",
    mainImage: "/images/hero-living-room.jpg",
    galleryJson: JSON.stringify(["/images/living-room-2.jpg", "/images/living-room-3.jpg"]),
    featuresJson: "[]",
    displayOrder: 0,
  },
  {
    slug: "kitchen-dining",
    name: "Kitchen & Dining",
    label: "KITCHEN & DINING",
    description:
      "A fully equipped kitchen with a dining area that invites long breakfasts and unhurried dinners. Designed for guests who like the option of eating in.",
    mainImage: "/images/kitchen-1.jpg",
    galleryJson: JSON.stringify(["/images/kitchen-2.jpg", "/images/living-room-3.jpg"]),
    featuresJson: "[]",
    displayOrder: 1,
  },
  {
    slug: "bedroom-one",
    name: "Bedroom One",
    label: "BEDROOM ONE",
    description:
      "The main bedroom. A quiet, considered space with quality linens, blackout comfort and room to unpack properly — designed for stays of any length.",
    mainImage: "/images/bedroom-1-main.jpg",
    galleryJson: JSON.stringify(["/images/bedroom-1-alt.jpg", "/images/bedroom-2-alt.jpg"]),
    featuresJson: "[]",
    displayOrder: 2,
  },
  {
    slug: "bedroom-two",
    name: "Bedroom Two",
    label: "BEDROOM TWO",
    description:
      "A calm second bedroom with the same attention to comfort — ideal for family, friends or simply having space to yourselves.",
    mainImage: "/images/bedroom-2-main.jpg",
    galleryJson: JSON.stringify(["/images/bedroom-2-alt.jpg", "/images/bedroom-1-alt.jpg"]),
    featuresJson: "[]",
    displayOrder: 3,
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    label: "BATHROOMS",
    description:
      "Warm stone tones, good water pressure and everything exactly where you expect it. Bathrooms that make getting ready feel unhurried.",
    mainImage: "/images/bathroom-1.jpg",
    galleryJson: JSON.stringify(["/images/bathroom-2.jpg"]),
    featuresJson: "[]",
    displayOrder: 4,
  },
];

const amenities = [
  { name: "High-Speed Wi-Fi", description: "Reliable connection throughout the apartment.", icon: "wifi", displayOrder: 0 },
  { name: "Air Conditioning", description: "Cool, quiet comfort in every room.", icon: "airVent", displayOrder: 1 },
  { name: "Smart TV", description: "Streaming-ready in the living space.", icon: "tv", displayOrder: 2 },
  { name: "Fully Equipped Kitchen", description: "Everything you need to cook and host.", icon: "cookingPot", displayOrder: 3 },
  { name: "Washing Machine", description: "In-unit laundry for longer stays.", icon: "shirt", displayOrder: 4 },
  { name: "Dedicated Work Corner", description: "A calm spot to catch up when you need to.", icon: "laptop", displayOrder: 5 },
  { name: "Private Bathrooms", description: "En-suite bathrooms finished in warm stone tones.", icon: "bath", displayOrder: 6 },
  { name: "Parking", description: "Space for your vehicle on the premises.", icon: "carFront", displayOrder: 7 },
  { name: "24-Hour Security", description: "Manned security around the clock.", icon: "shieldCheck", displayOrder: 8 },
  { name: "Backup Power", description: "An inverter system keeps the essentials running.", icon: "zap", displayOrder: 9 },
];

const gallery = [
  { src: "/images/hero-living-room.jpg", alt: "The Crayford living room", title: "Living Room", featured: true, displayOrder: 0 },
  { src: "/images/bedroom-1-main.jpg", alt: "Bedroom one", title: "Bedroom One", featured: false, displayOrder: 1 },
  { src: "/images/kitchen-1.jpg", alt: "Kitchen and dining", title: "Kitchen & Dining", featured: false, displayOrder: 2 },
  { src: "/images/living-room-2.jpg", alt: "Living room, second view", title: "Living Room", featured: false, displayOrder: 3 },
  { src: "/images/bedroom-2-main.jpg", alt: "Bedroom two", title: "Bedroom Two", featured: false, displayOrder: 4 },
  { src: "/images/bathroom-1.jpg", alt: "Bathroom", title: "Bathrooms", featured: false, displayOrder: 5 },
  { src: "/images/living-room-3.jpg", alt: "Living room detail", title: "Living Room", featured: false, displayOrder: 6 },
  { src: "/images/kitchen-2.jpg", alt: "Kitchen detail", title: "Kitchen & Dining", featured: false, displayOrder: 7 },
  { src: "/images/bedroom-1-alt.jpg", alt: "Bedroom one, second angle", title: "Bedroom One", featured: false, displayOrder: 8 },
  { src: "/images/bedroom-2-alt.jpg", alt: "Bedroom two, second angle", title: "Bedroom Two", featured: false, displayOrder: 9 },
  { src: "/images/bathroom-2.jpg", alt: "Second bathroom", title: "Bathrooms", featured: false, displayOrder: 10 },
  { src: "/images/exterior.jpg", alt: "The Crayford exterior", title: "Exterior", featured: false, displayOrder: 11 },
];

async function main() {
  // ── Admin user ────────────────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL || "admin@crayford.local";
  const password = process.env.ADMIN_PASSWORD || "CrayfordAdmin2026!";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Crayford Admin", passwordHash },
  });

  // ── Site settings ─────────────────────────────────────────────────────
  const settings: Record<string, string> = {
    "site.name": "Crayford Homes",
    "site.wordmark": "CRAYFORD HOMES",
    "site.tagline": "Thoughtfully designed stays.",
    "site.location": "5b, Oremeji Str, Onipetesi Estate, Mangoro Ikeja, Lagos",
    "site.address": "5b, Oremeji Str, Onipetesi Estate, Mangoro Ikeja, Lagos",
    "site.email": "crayfordhomes@gmail.com",
    "site.phone": "+234 906 566 4718",
    "site.phoneAlt": "+234 706 608 5785",
    "site.website": "https://www.crayfordhomes.com",
    "site.registration": "BN: 9301211",
    "site.instagram": "",
    "site.pricePerNight": "80000",
    "site.checkInTime": "14:00",
    "site.checkOutTime": "12:00",
    "announcement.message": "PREMIUM SHORT-STAY LIVING IN LAGOS",
    "announcement.status": "BOOKINGS OPEN",
    "booking.notes": "Payment is processed securely by Paystack.",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // ── Apartments ────────────────────────────────────────────────────────
  const apartments = [
    {
      slug: "apartment-1",
      name: "Apartment One",
      description:
        "The first Crayford apartment — two bedrooms, two bathrooms, the whole place to yourself.",
      location: "5b Oremeji street, Onipetesi, Ikeja, Lagos",
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 5,
      pricePerNight: 80000,
      displayOrder: 0,
    },
    {
      slug: "apartment-2",
      name: "Apartment Two",
      description:
        "The second Crayford apartment — the same calm Crayford standard: two bedrooms, two bathrooms, the whole place to yourself.",
      location: "5b Oremeji street, Onipetesi, Ikeja, Lagos",
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 5,
      pricePerNight: 80000,
      displayOrder: 1,
    },
  ];
  for (const apartment of apartments) {
    await prisma.apartment.upsert({
      where: { slug: apartment.slug },
      update: {},
      create: apartment,
    });
  }

  // ── Rooms / amenities / gallery (seed only when empty) ────────────────
  if ((await prisma.room.count()) === 0) {
    await prisma.room.createMany({ data: rooms });
  }
  if ((await prisma.amenity.count()) === 0) {
    await prisma.amenity.createMany({ data: amenities });
  }
  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({ data: gallery });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
