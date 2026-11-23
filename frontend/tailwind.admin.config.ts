import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B22222", // Header highlights, active nav, primary buttons
          hover: "#991b1b",
          light: "#FDF2F2",
          dark: "#7f1d1d",
        },
        brand: {
          green: {
            DEFAULT: "#0A5C36", // Lincoln Forest Green in User Management
            hover: "#084C2C",
            light: "#ECFDF5",
            subtle: "#D1FAE5",
            border: "#A7F3D0",
            text: "#065F46",
            badge: "#DEF7EC",
          },
          crimson: {
            DEFAULT: "#B22222",
            hover: "#991B1B",
            light: "#FEF2F2",
            border: "#FECACA",
            text: "#991B1B",
          },
        },
        dark: {
          DEFAULT: "#1A1A1A", // Dark typography, footer, dark accents
          soft: "#2A2A2A",
          muted: "#3E3E3E",
        },
        accent: {
          DEFAULT: "#C9A227", // Icons, badges, operational indicators, currency accents
          hover: "#B08D20",
          light: "#FDF8EA",
          tint: "rgba(201, 162, 39, 0.15)",
        },
        surface: {
          DEFAULT: "#F8F9FA",
          card: "#FFFFFF",
          subtle: "#F3F4F6",
        },
        muted: {
          DEFAULT: "#6B7280",
          foreground: "#9CA3AF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
