import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Crayford Homes brand palette (official letterhead) ────────── */
        brand: {
          red: "#971D1D",
          "red-dark": "#7A1717",
          pink: "#DDA8A8",
          "pink-soft": "#F6E8E8",
        },
        // Semantic aliases so components read naturally.
        primary: "#971D1D",
        "primary-dark": "#7A1717",
        accent: "#DDA8A8",
        "accent-soft": "#F6E8E8",
        ink: "#202020",
        "ink-soft": "#666666",
        paper: "#FFFFFF",
        "paper-warm": "#FAFAF8",
        // Compat shims — old class names keep compiling while being swept.
        charcoal: "#202020",
        warmblack: "#111111",
        cream: "#F6E8E8",
        warmwhite: "#FAFAF8",
        beige: "#E5E5E5",
        muted: "#666666",
        gold: {
          DEFAULT: "#971D1D",
          soft: "#7A1717",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        label: "0.22em",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "hero-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
        "scroll-dot": {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "25%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(14px)" },
        },
        "menu-in": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "fade-in": "fade-in 0.9s ease-out both",
        "hero-zoom": "hero-zoom 6s ease-out both",
        "scroll-dot": "scroll-dot 2.2s ease-in-out infinite",
        "menu-in": "menu-in 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
      },
    },
  },
  plugins: [],
};

export default config;
