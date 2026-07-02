import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { WeekendForecast } from "@/components/home/weekend-forecast";
import { UpcomingGrid } from "@/components/home/upcoming-grid";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { OrganizerCTA } from "@/components/home/organizer-cta";
import { Manifesto } from "@/components/home/manifesto";
import { Marquee } from "@/components/home/marquee";
import { FallbackBanner } from "@/components/site/fallback-banner";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { DataSourceProvider } from "@/components/site/data-source-context";
import { getEvents, getFeaturedEvents } from "@/lib/api";

export const revalidate = 300; // ISR — revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Find events worth going to in Bangladesh",
  description:
    "Cholo Jai is a curated weekly selection of events in Dhaka — workshops, talks, exhibitions, weekend markets, and quiet gatherings.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [featuredRes, eventsRes] = await Promise.all([
    getFeaturedEvents(),
    getEvents(),
  ]);

  const featured = featuredRes.data.filter((e) => e.start_date >= new Date().toISOString().slice(0, 10));
  const upcoming = eventsRes.data;
  const isFallback = featuredRes.source === "fallback" || eventsRes.source === "fallback";
  const lead = featured[0];
  const secondaryFeatured = featured.slice(1, 5);

  return (
    <DataSourceProvider source={isFallback ? "fallback" : "live"}>
      <PageViewTracker />
      {isFallback && <FallbackBanner />}

      {/* Hero */}
      <Hero upcomingCount={upcoming.length} />

      {/* Marquee strip — sets editorial tone */}
      <Marquee
        items={[
          "Curated weekly",
          "Dhaka and beyond",
          "No paywalls",
          "Free weekend picks",
          "Submitted, then verified",
          "Made in Bangladesh",
        ]}
      />

      {/* Weekend Forecast — first editorial beat */}
      <WeekendForecast events={upcoming} />

      {/* Featured Curator's Pick — full-width editorial layout */}
      {lead && (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-16 md:py-24">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Editor's pick</span>
                <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                  One event we'd attend this week.
                </h2>
              </div>
            </div>
            <FeaturedLead event={lead} />
            {secondaryFeatured.length > 0 && (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryFeatured.slice(0, 3).map((e) => (
                  <SmallFeaturedCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Manifesto — curatorial philosophy */}
      <Manifesto />

      {/* Upcoming grid */}
      <UpcomingGrid events={upcoming} />

      {/* Organizer CTA */}
      <OrganizerCTA />

      {/* Newsletter */}
      <NewsletterCTA />
    </DataSourceProvider>
  );
}

// Featured lead card — large editorial block
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";
import { formatEventDate, formatPrice } from "@/lib/utils";
import type { Event } from "@/lib/types";

function FeaturedLead({ event }: { event: Event }) {
  return (
    <article className="group relative grid grid-cols-1 overflow-hidden border border-rule bg-paper transition-all hover:border-ink-300 hover:shadow-paper-lg md:grid-cols-12">
      <Link href={`/events/${event.slug}`} className="absolute inset-0 z-10" aria-label={event.title}>
        <span className="sr-only">{event.title}</span>
      </Link>
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-200 md:col-span-7 md:aspect-auto md:h-full">
        <Image
          src={event.poster_url}
          alt={event.title}
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge variant="ink" className="bg-ink text-paper">Curator's pick</Badge>
          {event.price_type === "free" && (
            <Badge variant="outline" className="bg-paper/90">Free entry</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-between p-7 md:col-span-5 md:p-10">
        <div>
          <div className="eyebrow">{event.categories[0] ? event.categories[0].replace(/-/g, " ") : "Featured"}</div>
          <h3 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-balance text-ink md:text-4xl">
            {event.title}
          </h3>
          <p className="mt-4 line-clamp-4 text-ink-700 leading-relaxed">{event.description}</p>
        </div>
        <div className="mt-8">
          <div className="hairline mb-4" />
          <dl className="grid grid-cols-2 gap-y-3 text-xs">
            <dt className="eyebrow">When</dt>
            <dd className="text-ink">{formatEventDate(event.start_date, event.start_time)}</dd>
            <dt className="eyebrow">Where</dt>
            <dd className="text-ink">{event.venue_name}, {event.sub_area}</dd>
            <dt className="eyebrow">Cost</dt>
            <dd className="font-mono uppercase tracking-wider text-ink">{formatPrice(event.price_type, event.price_note)}</dd>
          </dl>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ember">
            Read the full listing
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );
}

function SmallFeaturedCard({ event }: { event: Event }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-rule bg-paper transition-all hover:border-ink-300 hover:-translate-y-0.5 hover:shadow-paper-lg">
      <Link href={`/events/${event.slug}`} className="absolute inset-0 z-10" aria-label={event.title}>
        <span className="sr-only">{event.title}</span>
      </Link>
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
        <Image
          src={event.poster_url}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.15em] text-ink-500">
          <Calendar className="h-3 w-3" />
          <time dateTime={event.start_date}>{formatEventDate(event.start_date, event.start_time)}</time>
        </div>
        <h3 className="mt-3 font-display text-xl leading-snug text-ink line-clamp-2">{event.title}</h3>
        <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-ink-700">
          <MapPin className="h-3 w-3 text-ink-500" />
          <span>{event.sub_area}</span>
        </div>
      </div>
    </article>
  );
}