/**
 * Crayford — central site configuration.
 *
 * This file is the single source of truth for all editable apartment
 * information. Update the placeholder values (marked with [PLACEHOLDER])
 * as real details are confirmed — every component reads from here, so
 * nothing needs to be changed anywhere else.
 */

export const siteConfig = {
  name: "Crayford Homes",
  wordmark: "CRAYFORD HOMES",
  tagline: "Thoughtfully designed stays.",

  // ── Official Crayford Homes details (client letterhead) ─────────────
  location: "5b, Oremeji Str, Onipetesi Estate, Mangoro Ikeja, Lagos",
  address: "5b, Oremeji Str, Onipetesi Estate, Mangoro Ikeja, Lagos",
  phone: "+234 906 566 4718",
  phoneAlt: "+234 706 608 5785",
  email: "crayfordhomes@gmail.com",
  website: "https://www.crayfordhomes.com",
  registration: "BN: 9301211",
  instagram: "[INSTAGRAM URL PLACEHOLDER]",

  // Rate in Naira per night for the whole apartment.
  pricePerNight: 80000,
  currency: "₦",

  // ── The two apartments ───────────────────────────────────────────────
  apartments: [
    { id: "apartment-1", name: "Apartment One", bedrooms: 2, bathrooms: 2, guests: 5 },
    { id: "apartment-2", name: "Apartment Two", bedrooms: 2, bathrooms: 2, guests: 5 },
  ],

  // Paystack payment setup — set the public key before going live.
  // Server-side secret key goes in .env.local (PAYSTACK_SECRET_KEY).
  payments: {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
  },

  heroHeadingLines: ["HOME AWAY", "FROM HOME"],
  heroSupportingText:
    "Private, considered short-stay living in Ikeja — designed around the way you actually want to stay.",

  announcement: {
    message: "PREMIUM SHORT-STAY LIVING IN LAGOS",
    status: "BOOKINGS OPEN",
  },
} as const;

/** Meta used for SEO / Open Graph. */
export const siteMeta = {
  title: "Crayford Homes | Premium Apartment Stays in Lagos",
  description:
    "Discover Crayford Homes — thoughtfully designed apartments for comfortable and memorable stays.",
} as const;

/** Tel link, or null while the phone is a placeholder. */
export function getPhoneUrl(): string | null {
  if (!/^\d[\d\s+-]{5,19}$/.test(siteConfig.phone)) return null;
  return `tel:${siteConfig.phone.replace(/[\s()]/g, "")}`;
}

/** Mailto link, or null while the email is a placeholder. */
export function getEmailUrl(): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteConfig.email)
    ? `mailto:${siteConfig.email}`
    : null;
}

/** Maps link, or null while the address is a placeholder. */
export function getDirectionsUrl(): string | null {
  const q = encodeURIComponent(`${siteConfig.name} Apartments, ${siteConfig.address}`);
  const isPlaceholder = siteConfig.address.includes("PLACEHOLDER");
  return isPlaceholder ? null : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export type Amenity = {
  name: string;
  description: string;
  icon: string;
};

/**
 * Placeholder amenities — edit freely.
 * `icon` must be a key of components/ui/AmenityIcon.tsx.
 */
export const amenities: Amenity[] = [
  { name: "High-Speed Wi-Fi", description: "Reliable connection throughout the apartment.", icon: "wifi" },
  { name: "Air Conditioning", description: "Cool, quiet comfort in every room.", icon: "airVent" },
  { name: "Smart TV", description: "Streaming-ready in the living space.", icon: "tv" },
  { name: "Fully Equipped Kitchen", description: "Everything you need to cook and host.", icon: "cookingPot" },
  { name: "Washing Machine", description: "In-unit laundry for longer stays.", icon: "shirt" },
  { name: "Dedicated Work Corner", description: "A calm spot to catch up when you need to.", icon: "laptop" },
  { name: "Private Bathrooms", description: "En-suite bathrooms finished in warm stone tones.", icon: "bath" },
  { name: "Parking", description: "Space for your vehicle on the premises.", icon: "carFront" },
  { name: "24-Hour Security", description: "Manned security around the clock.", icon: "shieldCheck" },
  { name: "Backup Power", description: "An inverter system keeps the essentials running.", icon: "zap" },
];

export type Room = {
  id: string;
  name: string;
  label: string;
  description: string;
  main: ImageRef | null;
  gallery: ImageRef[];
  /** Optional factual room features — leave empty until confirmed. */
  features?: string[];
};

export type ImageRef = {
  src: string;
  alt: string;
  /** Tailwind aspect classes, e.g. "aspect-[4/3]" */
  aspect?: string;
};

const img = (src: string, alt: string, aspect = "aspect-[4/3]"): ImageRef => ({
  src,
  alt,
  aspect,
});

export const rooms: Room[] = [
  {
    id: "living-room",
    name: "Living Room & Dining",
    label: "LIVING ROOM & DINING",
    description:
      "The heart of the apartment, where relaxed living meets effortless dining. Comfortable seating, warm natural light and a calm, refined palette create an inviting space for slow mornings, shared meals and easy evenings."
,
    main: img("/images/hero-living-room.jpg", "Crayford living room with generous natural light", "aspect-[16/10]"),
    gallery: [img("/images/living-room-2.jpg", "Second angle of the living room"), img("/images/living-room-3.jpg", "Living room detail")],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    label: "KITCHEN",
    description:
      "A fully equipped kitchen designed for effortless everyday cooking, with modern finishes, practical storage and everything you need to prepare meals comfortably during your stay.",
    main: img("/images/kitchen-1.jpg", "Crayford kitchen and dining area", "aspect-[16/10]"),
    gallery: [img("/images/kitchen-2.jpg", "Kitchen detail"), img("/images/living-room-3.jpg", "Dining detail")],
  },
  {
    id: "bedroom-one",
    name: "Bedroom One",
    label: "BEDROOM ONE",
    description:
      "The main bedroom. A quiet, considered space with quality linens, blackout comfort and room to unpack properly — designed for stays of any length.",
    main: img("/images/bedroom-1-main.jpg", "Crayford main bedroom", "aspect-[16/10]"),
    gallery: [img("/images/bedroom-1-alt.jpg", "Bedroom one, second angle"), img("/images/bedroom-2-alt.jpg", "Soft furnishing detail")],
  },
  {
    id: "bedroom-two",
    name: "Bedroom Two",
    label: "BEDROOM TWO",
    description:
      "A calm second bedroom with the same attention to comfort — ideal for family, friends or simply having space to yourselves.",
    main: img("/images/bedroom-2-main.jpg", "Crayford second bedroom", "aspect-[16/10]"),
    gallery: [img("/images/bedroom-2-alt.jpg", "Bedroom two, second angle"), img("/images/bedroom-1-alt.jpg", "Bedding detail")],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    label: "BATHROOMS",
    description:
      "Warm stone tones, good water pressure and everything exactly where you expect it. Bathrooms that make getting ready feel unhurried.",
    main: img("/images/bathroom-1.jpg", "Crayford bathroom", "aspect-[16/10]"),
    gallery: [img("/images/bathroom-2.jpg", "Second bathroom"), img("/images/bathroom-1.jpg", "Bathroom detail")],
  },
];

export type GalleryImage = ImageRef & { title: string };

export const galleryImages: GalleryImage[] = [
  { ...img("/images/hero-living-room.jpg", "The Crayford living room"), title: "Living Room" },
  { ...img("/images/bedroom-1-main.jpg", "Bedroom one"), title: "Bedroom One" },
  { ...img("/images/kitchen-1.jpg", "Kitchen and dining"), title: "Kitchen & Dining" },
  { ...img("/images/living-room-2.jpg", "Living room, second view"), title: "Living Room" },
  { ...img("/images/bedroom-2-main.jpg", "Bedroom two"), title: "Bedroom Two" },
  { ...img("/images/bathroom-1.jpg", "Bathroom"), title: "Bathrooms" },
  { ...img("/images/living-room-3.jpg", "Living room detail"), title: "Living Room" },
  { ...img("/images/kitchen-2.jpg", "Kitchen detail"), title: "Kitchen & Dining" },
  { ...img("/images/bedroom-1-alt.jpg", "Bedroom one, second angle"), title: "Bedroom One" },
  { ...img("/images/bedroom-2-alt.jpg", "Bedroom two, second angle"), title: "Bedroom Two" },
  { ...img("/images/bathroom-2.jpg", "Second bathroom"), title: "Bathrooms" },
  { ...img("/images/exterior.jpg", "The Crayford exterior"), title: "Exterior" },
];

export const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "The Apartment", href: "/apartment" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Location", href: "/location" },
] as const;
