import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1440px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        // Editorial warm palette — Cholo Jai
        // Bangladesh flag colors used SPARINGLY (green = subtle accent, red = outbound CTA only)
        cream: {
          DEFAULT: "#FAF7F2",
          50: "#FDFCF8",
          100: "#FAF7F2",
          200: "#F4EFE5",
          300: "#EBE3D2",
          400: "#D9CDB3",
        },
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A1A",
          900: "#0F0F0F",
          700: "#2D2D2D",
          500: "#6B6B6B",
          400: "#8B8B8B",
          300: "#B5B5B5",
          200: "#D4D4D4",
        },
        rule: "#E8E2D6",
        // Subtle Bangladesh-green accent — used like a single drop of color
        accent: {
          DEFAULT: "#006A4E",
          50: "#E6F1ED",
          100: "#C9E0D7",
          200: "#9CC9B8",
          300: "#5FA589",
          400: "#2E8466",
          500: "#006A4E",
          600: "#00563E",
          700: "#003F2C",
        },
        // Reserved for outbound CTA only — never as decorative color
        ember: {
          DEFAULT: "#C8341B",
          50: "#FBEAE6",
          100: "#F5CABE",
          200: "#EDA294",
          300: "#E37865",
          400: "#D45844",
          500: "#C8341B",
          600: "#A42913",
          700: "#7A1D0D",
        },
        // shadcn-style aliases (mapped to our palette)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        // Editorial display — Fraunces (variable, distinctive, supports Bengali transliteration well)
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        // Body / UI
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Bengali — for Bengali text passages
        bengali: ["var(--font-hind-siliguri)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Mono for dates, ticket codes
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Editorial scale — distinctive display sizes, generous body
        "display-xl": ["clamp(3.25rem, 8vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.5rem, 2.6vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        // Soft, paper-like shadows — NOT heavy drop shadows
        "paper": "0 1px 2px rgba(15, 15, 15, 0.04), 0 2px 8px rgba(15, 15, 15, 0.04)",
        "paper-lg": "0 2px 4px rgba(15, 15, 15, 0.05), 0 12px 32px rgba(15, 15, 15, 0.06)",
        "ink": "0 1px 0 rgba(15, 15, 15, 0.04)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2.4s linear infinite",
        "marquee": "marquee 60s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;