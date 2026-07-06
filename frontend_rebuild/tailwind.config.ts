import type { Config } from "tailwindcss";

// Ghurighuri brand palette (per brand_strategy.md):
//   Primary:    Deep Orange #F97316, Warm Yellow #FACC15
//   Secondary:  White, Charcoal Black, Sky Blue (accent)
//
// Original tokens (cream/paper/ink/rule/accent/ember) are kept as aliases
// so every existing class keeps working without a sweeping refactor.

const palette = {
  // Warm Yellow primary — replaces the original cream family
  yellow: {
    DEFAULT: "#FACC15",
    50: "#FEFCE8",
    100: "#FEF7C3",
    200: "#FEF08A",
    300: "#FDE047",
    400: "#FACC15",
    500: "#EAB308",
  },
  // Deep Orange — replaces the original ember family (primary action color)
  orange: {
    DEFAULT: "#F97316",
    50: "#FFF5EC",
    100: "#FFE6D1",
    200: "#FFC79C",
    300: "#FFA668",
    400: "#FB8B36",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
  },
  // Sky Blue accent — replaces the original green accent family
  sky: {
    DEFAULT: "#38BDF8",
    50: "#EFF8FF",
    100: "#DBEDFE",
    200: "#BFDFFE",
    300: "#93C9FD",
    400: "#60A5FA",
    500: "#38BDF8",
    600: "#0EA5E9",
    700: "#0284C7",
  },
  // Charcoal Black — replaces the original ink family
  charcoal: {
    DEFAULT: "#1A1A1A",
    900: "#0F0F0F",
    700: "#262626",
    500: "#525252",
    400: "#737373",
    300: "#A3A3A3",
    200: "#D4D4D4",
  },
};

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
        // Ghurighuri brand palette — primary orange + yellow, sky-blue accent.
        orange: palette.orange,
        yellow: palette.yellow,
        sky: palette.sky,
        charcoal: palette.charcoal,

        // ─── Compat aliases (legacy tokens from the editorial system) ───
        // cream → warm-tinted near-white. Page background — quiet so the
        // brand orange/yellow pop on top, but unmistakably warm (not gray).
        cream: {
          DEFAULT: "#FFFBF0",          // cream-50: page bg — warm cream, not gray
          50: "#FFFBF0",               // lightest cream — page background
          100: "#FFF6DC",              // cream-100: faint yellow wash (cards, bands)
          200: "#FBE9C2",              // cream-200: card chips, subtle warm fill
          300: "#F5D78A",              // cream-300: stronger warm fill
          400: palette.yellow[100],    // cream-400: warm-yellow underline area
        },
        // paper → white
        paper: "#FFFFFF",
        // ink → charcoal
        ink: {
          DEFAULT: palette.charcoal.DEFAULT,
          900: palette.charcoal[900],
          700: palette.charcoal[700],
          500: palette.charcoal[500],
          400: palette.charcoal[400],
          300: palette.charcoal[300],
          200: palette.charcoal[200],
        },
        // rule → warm-tinted divider (deep-orange 50 → still readable)
        rule: "#FFE6D1",
        // accent → sky blue (replaces Bangladesh green throughout)
        accent: {
          DEFAULT: palette.sky.DEFAULT,
          50: palette.sky[50],
          100: palette.sky[100],
          200: palette.sky[200],
          300: palette.sky[300],
          400: palette.sky[400],
          500: palette.sky.DEFAULT,
          600: palette.sky[600],
          700: palette.sky[700],
        },
        // ember → deep orange (outbound CTA, primary action color)
        ember: {
          DEFAULT: palette.orange.DEFAULT,
          50: palette.orange[50],
          100: palette.orange[100],
          200: palette.orange[200],
          300: palette.orange[300],
          400: palette.orange[400],
          500: palette.orange.DEFAULT,
          600: palette.orange[600],
          700: palette.orange[700],
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
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-ui"],
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
