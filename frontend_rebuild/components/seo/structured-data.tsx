// JSON-LD structured data for SEO + GEO (Generative Engine Optimization).
// AI search engines (ChatGPT, Perplexity, Gemini, Claude) cite pages with
// structured data more often than pages without. We emit schemas as plain
// <script type="application/ld+json"> so search engines + LLMs can extract
// entities, relationships, and answers without parsing prose.
//
// References:
// - https://schema.org/Event
// - https://schema.org/Organization
// - https://schema.org/WebSite
// - https://schema.org/FAQPage

import * as React from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Ghurighuri";
const SITE_DESCRIPTION =
  "Ghurighuri — your next stop for ghurighuri. A curated weekly list of events worth stepping out for, in Dhaka.";

interface OrganizationSchemaProps {
  // Override default logo URL if you ship one at a different path.
  logoUrl?: string;
}

// <OrganizationSchema /> — emits the brand entity. Sits at site root so all
// pages inherit the same brand identity (name, social, contact).
export function OrganizationSchema({ logoUrl = "/og-default.png" }: OrganizationSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["Ghurighuri", "Ghuri Ghuri"],
    url: SITE_URL,
    logo: `${SITE_URL}${logoUrl}`,
    description: SITE_DESCRIPTION,
    foundingLocation: { "@type": "Place", name: "Dhaka, Bangladesh" },
    sameAs: [
      "https://instagram.com/ghurighuri",
      "https://facebook.com/ghurighuri",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@ghurighuri.bd",
        availableLanguage: ["English", "Bengali"],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// <WebSiteSchema /> — adds sitelinks search box eligibility + name entity.
export function WebSiteSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-BD",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/events?q={search_term_string}`,
      // Schema.org requires `query-input` for SearchAction. We keep the
      // template minimal so AI crawlers parse the action's intent.
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// <EventSchema /> — emits a single Event entity for an event detail page.
// Boosts AI citation per the Princeton GEO study (+40% visibility with
// structured data, +25% with authoritative tone — schema.org helps both).
export interface EventSchemaEvent {
  slug: string;
  title: string;
  description: string;
  poster_url: string;
  start_date: string; // ISO date "YYYY-MM-DD"
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  venue_name: string;
  area_details?: string | null;
  sub_area: string;
  city: string;
  maps_link?: string | null;
  price_type: "free" | "paid";
  price_note?: string | null;
  organizer: {
    name: string;
    email?: string | null;
    phone?: string | null;
    social_link?: string | null;
  };
  categories: string[];
  audience_tags?: string[];
  status: string;
  is_featured?: boolean;
}

export function EventSchema({ event }: { event: EventSchemaEvent }) {
  const startISO = `${event.start_date}${event.start_time ? `T${event.start_time}` : "T00:00"}`;
  const endISO = event.end_date
    ? `${event.end_date}${event.end_time ? `T${event.end_time}` : "T23:59"}`
    : `${event.start_date}${event.start_time ? `T${addHour(event.start_time)}` : "T23:59"}`;

  const offers =
    event.price_type === "free"
      ? {
          "@type": "Offer",
          price: 0,
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/events/${event.slug}`,
        }
      : {
          "@type": "Offer",
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/events/${event.slug}`,
          ...(event.price_note ? { description: event.price_note } : {}),
        };

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}/events/${event.slug}#event`,
    name: event.title,
    description: event.description,
    startDate: startISO,
    endDate: endISO,
    eventStatus: mapEventStatus(event.status),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${SITE_URL}${event.poster_url}`],
    location: {
      "@type": "Place",
      name: event.venue_name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.area_details ?? event.venue_name,
        addressLocality: event.sub_area,
        addressRegion: event.city,
        addressCountry: "BD",
      },
      ...(event.maps_link ? { hasMap: event.maps_link } : {}),
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      ...(event.organizer.email ? { email: event.organizer.email } : {}),
      ...(event.organizer.phone ? { telephone: event.organizer.phone } : {}),
      ...(event.organizer.social_link ? { sameAs: event.organizer.social_link } : {}),
    },
    offers,
    keywords: [
      ...event.categories,
      ...(event.audience_tags ?? []),
      "Dhaka",
      "Bangladesh",
    ].join(", "),
    isAccessibleForFree: event.price_type === "free",
    inLanguage: "en-BD",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

// <FAQSchema /> — adds FAQPage schema. Per Princeton GEO study, FAQ schema
// gives +40% AI citation visibility for matching questions.
export function FAQSchema({ items }: { items: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// <BreadcrumbSchema /> — helps AI engines understand page hierarchy.
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url.startsWith("http") ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── helpers ──────────────────────────────────────────────────────────────

function mapEventStatus(status: string): string {
  switch (status) {
    case "cancelled":
      return "https://schema.org/EventCancelled";
    case "postponed":
      return "https://schema.org/EventPostponed";
    case "rescheduled":
      return "https://schema.org/EventRescheduled";
    default:
      return "https://schema.org/EventScheduled";
  }
}

function addHour(time: string): string {
  const [h, m, s] = time.split(":").map((x) => parseInt(x, 10));
  const next = ((h ?? 0) + 1) % 24;
  return `${String(next).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}${s != null ? `:${String(s).padStart(2, "0")}` : ""}`;
}