import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EFE7",
        bone: "#FAF8F2",
        ivory: "#FFFFFE",
        ink: "#0E0E0C",
        ash: "#6E6E68",
        steel: "#A6A6A0",
        accent: "#E63946",
        moss: "#3C5A40",
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo Black", "Impact", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.04em",
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
      gridTemplateColumns: {
        ed12: "repeat(12, minmax(0, 1fr))",
        ed6: "repeat(6, minmax(0, 1fr))",
      },
      maxWidth: {
        ed: "1360px",
      },
      zIndex: {
        nav: "50",
        drawer: "60",
        modal: "70",
      },
      fontSize: {
        mega: ["clamp(4rem, 16vw, 18rem)", { lineHeight: "0.82", letterSpacing: "-0.05em" }],
      },
    },
  },
  plugins: [],
};

export default config;