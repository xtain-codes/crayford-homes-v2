import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { siteMeta } from "@/lib/site";

import "./globals.css";

/* Self-hosted brand fonts (variable, latin subset) — no build-time network
   dependency and faster loads than the Google Fonts loader. */
const serif = localFont({
  src: "./fonts/cormorant-garamond-latin.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-serif",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: siteMeta.title,
    template: `%s | ${siteMeta.title.split(" | ")[0]}`,
  },
  description: siteMeta.description,
  keywords: ["Crayford", "apartment", "short stay", "Lagos", "luxury apartment"],
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    type: "website",
    locale: "en_NG",
    siteName: "Crayford Homes",
    images: [{ url: "/images/og.svg", width: 1600, height: 900, alt: "Crayford Homes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
    images: ["/images/og.svg"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#971d1d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
