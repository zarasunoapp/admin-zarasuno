import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E8F0EA",
          100: "#CFE1D5",
          200: "#A3C6B2",
          300: "#6FA88E",
          400: "#3C8A6A",
          500: "#0B5D4B",
          600: "#0A5041",
          700: "#083E33",
          800: "#052C24",
          900: "#031D18",
          DEFAULT: "#0B5D4B",
        },
        gold: {
          50: "#FAF3E0",
          100: "#F3E4BC",
          200: "#EACF8C",
          300: "#E1BB5E",
          400: "#D9A94C",
          500: "#BE8E30",
          600: "#98701F",
          DEFAULT: "#D9A94C",
        },
        clay: {
          50: "#F7ECE5",
          100: "#EBD2C4",
          200: "#DCAF97",
          DEFAULT: "#C97B57",
        },
        cream: "#F2E9D5",
        ivory: "#F7F3EA",
        sage: "#CADFCE",
        ink: "#14211D",
        muted: "#6B7A73",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 34px -14px rgba(11,93,75,0.22)",
        cardHover: "0 26px 55px -18px rgba(11,93,75,0.38)",
        gold: "0 14px 32px -12px rgba(217,169,76,0.60)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "grad-gold": "linear-gradient(135deg,#E4C169 0%,#D9A94C 55%,#C0902F 100%)",
        "grad-green": "linear-gradient(135deg,#0E6E58 0%,#0B5D4B 55%,#083E33 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
