import { Suspense } from "react";
import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Calendar, MapPin, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { WeekendForecast } from "@/components/home/weekend-forecast";
import { UpcomingGrid } from "@/components/home/upcoming-grid";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { OrganizerCTA } from "@/components/home/organizer-cta";
import { Marquee } from "@/components/home/marquee";
import { SectorExplorer } from "@/components/home/sector-explorer";
import { CategoryExplorer } from "@/components/home/category-explorer";
import { CalendarView } from "@/components/home/calendar-view";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { DataSourceProvider } from "@/components/site/data-source-context";
import { HorizontalSnap } from "@/components/mobile/horizontal-snap";
import { NavFab } from "@/components/mobile/nav-fab";
import { EventCard } from "@/components/events/event-card";
import { formatEventDate, formatPrice } from "@/lib/utils";
import {
  DEFAULT_HOME_CONFIG,
  readHomeConfig as readLocalHomeConfig,
} from "@/lib/cms-store";
import {
  serverGetEvents,
  serverGetFeaturedEvents,
  serverGetHeroEvents,
} from "@/lib/api.server";
import { getLocaleFromHeaders } from "@/lib/i18n/server";
import type { Event } from "@/lib/types";
import type {
  HomePageConfig,
  HomeSectionConfig,
  HomeSectionId,
} from "@/lib/cms-store";

export const revalidate = 300; // ISR — revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Your next stop for ghurighuri",
  description:
    "Discover. Explore. Experience. A curated weekly selection of things worth stepping out for in Dhaka &mdash; concerts, cafés, workshops, weekend markets, and quiet corners.",
  alternates: {
    canonical: "/",
  },
};

function isEnabled(sections: Record<string, HomeSectionConfig>, id: HomeSectionId): boolean {
  const sec = sections[id];
  return Boolean(sec?.enabled ?? true);
}

function getMaxItems(sections: Record<string, HomeSectionConfig>, id: HomeSectionId, fallback: number): number {
  const sec = sections[id] as { maxItems?: number } | undefined;
  const n = sec?.maxItems;
  return Number.isFinite(n) && (n as number) > 0 ? (n as number) : fallback;
}

function getWindowDays(sections: Record<string, HomeSectionConfig>, id: HomeSectionId): 7 | 14 {
  const sec = sections[id] as { windowDays?: 7 | 14 } | undefined;
  return sec?.windowDays === 14 ? 14 : 7;
}

function getMarqueeItems(
  sections: Record<string, HomeSectionConfig>,
): { en: string; bn?: string }[] {
  const sec = sections.marquee as { items?: { en: string; bn?: string }[] } | undefined;
  return Array.isArray(sec?.items) && sec.items.length > 0
    ? sec.items
    : [
        { en: "Discover. Explore. Experience." },
        { en: "Your next stop for ghurighuri" },
        { en: "Friday through Sunday — picked for you" },
        { en: "Made with love in Dhaka" },
      ];
}

export default async function HomePage() {
  const [locale, localHome, upcoming, featured, heroEvents] = await Promise.all([
    getLocaleFromHeaders(),
    readLocalHomeConfig(),
    serverGetEvents(),
    serverGetFeaturedEvents(),
    serverGetHeroEvents(),
  ]);
  const home: HomePageConfig = localHome ?? DEFAULT_HOME_CONFIG;
  const isLiveBackend = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);

  const today = new Date().toISOString().slice(0, 10);
  const filteredFeatured = featured.filter((e) => e.start_date >= today);
  const filteredHero = heroEvents.filter((e) => e.start_date >= today);
  const isFallback = !isLiveBackend;
  const lead = filteredFeatured[0];
  const secondaryFeatured = filteredFeatured.slice(1, 5);

  // Mobile "happening today" beat — next 3 events from today
  const happeningToday = upcoming
    .filter((e) => e.start_date >= today)
    .slice(0, getMaxItems(home.sections, "mobile_happening_today", 6));

  const sections = home.sections;
  const order = home.order;

  // Helper that renders a section by id. Returns null if disabled or empty.
  const renderSection = (id: HomeSectionId): React.ReactNode => {
    if (!isEnabled(sections, id)) return null;
    switch (id) {
      case "hero":
        return filteredHero.length > 0 ? (
          <HeroCarousel events={filteredHero.slice(0, getMaxItems(sections, "hero", 5))} />
        ) : null;
      case "marquee":
        return <Marquee items={getMarqueeItems(sections)} locale={locale} />;
      case "mobile_happening_today":
        return happeningToday.length > 0 ? (
          <section className="mobile-only border-b border-rule bg-background py-6">
            <div className="mb-4 flex items-end justify-between px-4">
              <div>
                <span className="eyebrow">Tonight &middot; tomorrow</span>
                <h2 className="mt-1.5 font-display text-2xl tracking-tight text-ink">
                  Wanna go somewhere?
                </h2>
              </div>
            </div>
            <HorizontalSnap ariaLabel="Happening soon" itemWidth="min(86%, 340px)">
              {happeningToday.map((e) => (
                <EventCard key={e.id} event={e} variant="horizontal" />
              ))}
            </HorizontalSnap>
          </section>
        ) : null;
      case "weekend_forecast":
        return <WeekendForecast events={upcoming} />;
      case "featured_lead":
        if (!lead) return null;
        return (
          <section className="border-b border-rule bg-background">
            <div className="editorial-container py-12 md:py-24">
              <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
                <div>
                  <span className="eyebrow">We&rsquo;d go</span>
                  <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                    If we had one free evening this week.
                  </h2>
                </div>
              </div>
              <FeaturedLead event={lead} />
              {secondaryFeatured.length > 0 && (
                <div className="mt-12 hidden grid-cols-1 gap-6 sm:mt-12 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3">
                  {secondaryFeatured.slice(0, 3).map((e) => (
                    <SmallFeaturedCard key={e.id} event={e} />
                  ))}
                </div>
              )}
              {secondaryFeatured.length > 0 && (
                <div className="mt-8 mobile-only">
                  <HorizontalSnap
                    ariaLabel="More editor's picks"
                    itemWidth="min(82%, 280px)"
                    showProgress
                  >
                    {secondaryFeatured.slice(0, 6).map((e) => (
                      <SmallFeaturedCard key={e.id} event={e} />
                    ))}
                  </HorizontalSnap>
                </div>
              )}
            </div>
          </section>
        );
      case "sector_explorer":
        return <SectorExplorer events={upcoming} />;
      case "category_explorer":
        return <CategoryExplorer events={upcoming} />;
      case "calendar":
        return <CalendarView events={upcoming} />;
      case "upcoming_grid":
        return <UpcomingGrid events={upcoming} />;
      case "organizer_cta":
        return <OrganizerCTA />;
      case "newsletter":
        return <NewsletterCTA />;
      default:
        return null;
    }
  };

  return (
    <DataSourceProvider source={isFallback ? "fallback" : "live"}>
      <PageViewTracker />

      {order.map((id) => (
        <React.Fragment key={id}>{renderSection(id)}</React.Fragment>
      ))}

      {/* Floating quick date filters (mobile only) */}
      <NavFab />
    </DataSourceProvider>
  );
}

// Featured lead card — large editorial block (desktop)
function FeaturedLead({ event }: { event: Event }) {
  return (
    <article className="group relative grid min-w-0 grid-cols-1 overflow-hidden border border-rule bg-paper transition-all hover:border-ink-300 hover:shadow-paper-lg md:grid-cols-12">
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
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge variant="ink" className="bg-ink text-paper">Curator's pick</Badge>
          {event.price_type === "free" && (
            <Badge variant="outline" className="bg-paper/90">Free entry</Badge>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-between p-6 md:col-span-5 md:p-10">
        <div className="min-w-0">
          <div className="eyebrow">{event.categories[0] ? event.categories[0].replace(/-/g, " ") : "Featured"}</div>
          <h3 className="mt-4 break-words font-display text-2xl leading-[1.1] tracking-tight text-balance text-ink md:text-4xl">
            {event.title}
          </h3>
          <p className="mt-4 line-clamp-4 break-words text-sm text-ink-700 md:text-base leading-relaxed">{event.description}</p>
        </div>
        <div className="mt-8">
          <div className="hairline mb-4" />
          <dl className="grid grid-cols-[5rem_1fr] items-baseline gap-x-4 gap-y-3 text-xs">
            <dt className="eyebrow">When</dt>
            <dd className="min-w-0 break-words text-ink">{formatEventDate(event.start_date, event.start_time)}</dd>
            <dt className="eyebrow">Where</dt>
            <dd className="min-w-0 break-words text-ink">{event.venue_name}, {event.sub_area}</dd>
            <dt className="eyebrow">Cost</dt>
            <dd className="break-words font-mono uppercase tracking-wider text-ink">{formatPrice(event.price_type, event.price_note)}</dd>
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
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-rule bg-paper transition-all hover:border-ink-300 hover:-translate-y-0.5 hover:shadow-paper-lg">
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
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex min-w-0 items-center gap-2 text-[0.6875rem] uppercase tracking-[0.15em] text-ink-500">
          <Calendar className="h-3 w-3 shrink-0" />
          <time dateTime={event.start_date} className="truncate">{formatEventDate(event.start_date, event.start_time)}</time>
        </div>
        <h3 className="mt-3 break-words font-display text-lg leading-snug text-ink line-clamp-2 sm:text-xl">{event.title}</h3>
        <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-ink-700">
          <MapPin className="h-3 w-3 shrink-0 text-ink-500" />
          <span className="truncate">{event.sub_area}</span>
        </div>
      </div>
    </article>
  );
}

// Re-export React so the file can be parsed standalone.
