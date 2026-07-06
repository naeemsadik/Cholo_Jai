import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Inter,
  Hind_Siliguri,
  JetBrains_Mono,
  Anek_Bangla,
} from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/structured-data";
import { InjectedHead } from "@/components/seo/injected-head";
import { InjectedBody } from "@/components/seo/injected-body";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocaleFromHeaders } from "@/lib/i18n/server";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Anek Bangla — display companion to Fraunces for Bangla-script headings.
// Pairs with Hind Siliguri (body) and shares Inter's calm, contemporary voice.
// Designed by Google with explicit Bengali script coverage; weights 400–700
// are enough for display work.
const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-anek-bangla",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Ghurighuri";
const SITE_DESCRIPTION =
  "Ghurighuri — your next stop for ghurighuri. Five hand-picked things to do in Dhaka each week, no paywalls, no promotional fluff.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Your next stop for ghurighuri in Dhaka`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "events Bangladesh",
    "Dhaka events",
    "events worth stepping out for",
    "workshops Dhaka",
    "seminars Bangladesh",
    "weekend events",
    "curated events",
    "Ghurighuri",
  ],
  authors: [{ name: "Ghurighuri" }],
  creator: "Ghurighuri",
  publisher: "Ghurighuri",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Your next stop for ghurighuri in Dhaka`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Ghurighuri — your next stop for ghurighuri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Your next stop for ghurighuri`,
    description: SITE_DESCRIPTION,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromHeaders();
  const dict = getDictionary(locale);
  // `lang` drives the browser's font fallback, hyphenation, and
  // accessibility tree. We also add a `.bn`/`.en` body class for
  // script-specific tweaks (line-height, letter-spacing, fonts).
  const langAttr = locale === "bn" ? "bn" : "en";
  const scriptClass = locale === "bn" ? "bn" : "en";

  return (
    <html
      lang={langAttr}
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${hindSiliguri.variable} ${anekBangla.variable} ${jetbrains.variable}`}
    >
      <body
        className={`min-h-screen bg-background font-sans antialiased ${scriptClass}`}
      >
        <I18nProvider locale={locale} dict={dict}>
          {/* Site-wide structured data for SEO + GEO (AI citation eligibility). */}
          <OrganizationSchema />
          <WebSiteSchema />
          {/* Admin-authored head-placed pixels (GA4, TikTok, custom) + custom <meta> tags.
              Server-rendered so they fire on first paint, no FOUC. */}
          <InjectedHead />
          {children}
          {/* Admin-authored body-bottom pixels (Facebook Pixel standard placement).
              Rendered after children so fbq('init') fires once the DOM is ready. */}
          <InjectedBody />
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}