import type { Metadata } from "next";
import { Inter, Archivo_Black, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});
const display = Archivo_Black({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: "400",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});
const serif = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cholojai.bd"),
  title: "Cholo Jai — Find events worth going to · Dhaka",
  description:
    "A curated editorial index of events in Dhaka — workshops, gigs, Iftar walks, weekend runs, exhibitions, talks. Updated daily. Free to submit.",
  openGraph: {
    title: "Cholo Jai · Dhaka Events Index",
    description:
      "A curated editorial index of things to do in Dhaka. Workshops, weekend runs, gigs, exhibitions — hand-picked daily.",
    type: "website",
    locale: "en_BD",
    siteName: "Cholo Jai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cholo Jai · Dhaka Events",
    description: "A curated editorial index of things to do in Dhaka.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F2EFE7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} ${serif.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:text-ivory focus:px-4 focus:py-2 focus:text-sm focus:font-mono focus:uppercase focus:tracking-widest"
        >
          Skip to content
        </a>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}