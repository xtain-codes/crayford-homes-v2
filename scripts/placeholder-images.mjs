import fs from "fs";
import path from "path";
import sharp from "sharp";

// One-off script: rasterizes branded SVG placeholders into real JPEGs in
// public/images so the site renders fully before real photography is
// supplied. Re-run any time: node scripts/placeholder-images.mjs
const TARGETS = [
  "hero-living-room.jpg",
  "living-room-2.jpg",
  "living-room-3.jpg",
  "kitchen-1.jpg",
  "kitchen-2.jpg",
  "bedroom-1-main.jpg",
  "bedroom-1-alt.jpg",
  "bedroom-2-main.jpg",
  "bedroom-2-alt.jpg",
  "bathroom-1.jpg",
  "bathroom-2.jpg",
  "exterior.jpg",
];

const OUT_DIR = path.join(process.cwd(), "public", "images");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PALETTES = [
  { bg: "#211d17", deep: "#14120e", accent: "#B89B5E" },
  { bg: "#1d2124", deep: "#121416", accent: "#A8B0B5" },
  { bg: "#241f1a", deep: "#151210", accent: "#C9A96A" },
  { bg: "#1a1e1c", deep: "#101312", accent: "#9BA8A0" },
  { bg: "#262019", deep: "#161310", accent: "#CBAF7B" },
];

function labelFor(filename) {
  const map = {
    "hero-living-room": "LIVING ROOM",
    "living-room-2": "LIVING ROOM — II",
    "living-room-3": "LIVING ROOM — III",
    "kitchen-1": "KITCHEN & DINING",
    "kitchen-2": "KITCHEN — II",
    "bedroom-1-main": "BEDROOM ONE",
    "bedroom-1-alt": "BEDROOM ONE — II",
    "bedroom-2-main": "BEDROOM TWO",
    "bedroom-2-alt": "BEDROOM TWO — II",
    "bathroom-1": "BATHROOMS",
    "bathroom-2": "BATHROOMS — II",
    exterior: "THE APARTMENT",
  };
  return map[filename] ?? "CRAYFORD";
}

function makeSvg(filename, index) {
  const w = 1600;
  const h = 1067;
  const { bg, deep, accent } = PALETTES[index % PALETTES.length];
  const label = labelFor(filename);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="56" y="56" width="${w - 112}" height="${h - 112}" fill="none" stroke="${accent}" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="${w / 2}" y="${h / 2 - 40}" font-family="Georgia, 'Times New Roman', serif" font-size="92" letter-spacing="14" fill="#F5F1E8" text-anchor="middle">CRAYFORD</text>
  <text x="${w / 2}" y="${h / 2 + 44}" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="10" fill="${accent}" text-anchor="middle">${label}</text>
  <text x="${w / 2}" y="${h - 92}" font-family="Helvetica, Arial, sans-serif" font-size="19" letter-spacing="3" fill="#F5F1E8" fill-opacity="0.55" text-anchor="middle">Placeholder — replace with photography: public/images/${filename}</text>
</svg>`;
}

for (const [index, filename] of TARGETS.entries()) {
  const svg = Buffer.from(makeSvg(filename, index), "utf8");
  await sharp(svg)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_DIR, filename));
}

console.log(`Wrote ${TARGETS.length} placeholder images to public/images`);
