import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crayford.example.com"; // Replace with the real domain at deployment.
  return ["", "/apartment", "/gallery", "/location", "/book"].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
