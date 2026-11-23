import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Estate Brand Palette
        primary: {
          DEFAULT: "#B22222",
          hover: "#991b1b",
          light: "#fef2f2",
          dark: "#7f1d1d",
        },
        dark: {
          DEFAULT: "#1A1A1A",
          soft: "#262626",
          muted: "#404040",
        },
        accent: {
          DEFAULT: "#C9A227",
          hover: "#b38f20",
          light: "#fefce8",
          dark: "#854d0e",
        },
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
