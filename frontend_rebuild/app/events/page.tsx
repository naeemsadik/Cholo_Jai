import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Inbox } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { FilterBar } from "@/components/events/filter-bar";
import { FallbackBanner } from "@/components/site/fallback-banner";
import { DataSourceProvider } from "@/components/site/data-source-context";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { getEvents, getLookups } from "@/lib/api";
import { readFiltersFromUrl } from "@/lib/utils";
import type { Event } from "@/lib/types";

export const revalidate = 120; // ISR — listings revalidate every 2 min

export const metadata: Metadata = {
  title: "All events",
  description:
    "Browse all curated events in Dhaka. Filter by city, sub-area, date, category, and audience tag.",
  alternates: { canonical: "/events" },
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") params.set(k, v);
    else if (Array.isArray(v)) params.set(k, v[0]);
  }
  const filters = readFiltersFromUrl(params);
  const [eventsRes, lookupsRes, totalRes] = await Promise.all([
    getEvents(filters),
    getLookups(),
    getEvents({}),
  ]);

  const events = eventsRes.data;
  const totalCount = totalRes.data.length;
  const isFallback = eventsRes.source === "fallback";

  // Group by date for editorial sectioning (only when no date filter applied)
  const grouped = groupByDate(events);

  return (
    <DataSourceProvider source={isFallback ? "fallback" : "live"}>
      <PageViewTracker />
      {isFallback && <FallbackBanner />}

      {/* Page header — editorial */}
      <section className="border-b border-rule bg-cream-50">
        <div className="editorial-container py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-ink-500">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">All events</span>
          </nav>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <span className="eyebrow">The Listings</span>
              <h1 className="mt-3 font-display text-display-lg tracking-tight text-balance">
                {filters.weekend
                  ? "Things to do this weekend."
                  : filters.category
                  ? `${filters.category.replace(/-/g, " ")} in Dhaka.`
                  : "All curated events, in chronological order."}
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-sm text-ink-700 leading-relaxed">
                Every listing below has been checked by a curator. New events are added
                throughout the week — refresh any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <Suspense>
        <FilterBar
          initialFilters={filters}
          resultCount={events.length}
          totalCount={totalCount}
        />
      </Suspense>

      {/* Results */}
      <section>
        <div className="editorial-container py-10 md:py-12">
          {events.length === 0 ? (
            <EmptyState hasFilters={Object.values(filters).some((v) => v !== undefined && v !== false && v !== "")} />
          ) : grouped.length > 1 && !filters.date_from && !filters.date_to && !filters.search ? (
            <div className="space-y-12">
              {grouped.map((group) => (
                <div key={group.label}>
                  <div className="mb-6 flex items-baseline gap-4">
                    <h2 className="font-display text-2xl text-ink">{group.label}</h2>
                    <span className="text-xs text-ink-500 font-mono uppercase tracking-wider">{group.events.length} events</span>
                    <div className="flex-1 hairline" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.events.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </DataSourceProvider>
  );
}

function groupByDate(events: Event[]) {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() + 7);
  const sevenDaysStr = sevenDays.toISOString().slice(0, 10);

  const thisWeek = events.filter((e) => e.start_date >= today && e.start_date <= sevenDaysStr);
  const later = events.filter((e) => e.start_date > sevenDaysStr);

  const result: { label: string; events: typeof events }[] = [];
  if (thisWeek.length) result.push({ label: "This week", events: thisWeek });
  if (later.length) result.push({ label: "Later this month", events: later });
  return result;
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <Inbox className="h-10 w-10 text-ink-300" aria-hidden />
      <h3 className="mt-6 font-display text-2xl text-ink">
        {hasFilters ? "Nothing matches those filters." : "No upcoming events yet."}
      </h3>
      <p className="mt-3 max-w-md text-ink-500 leading-relaxed">
        {hasFilters
          ? "Try widening your filters — remove a category, sub-area, or date, and see what turns up."
          : "Check back soon. New curated events land every week."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/events"
          className="inline-flex h-10 items-center rounded-full border border-rule bg-paper px-5 text-sm font-medium hover:border-ink transition-colors"
        >
          Clear filters
        </Link>
        <Link
          href="/submit"
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-ink-700 transition-colors"
        >
          Submit an event
        </Link>
      </div>
    </div>
  );
}