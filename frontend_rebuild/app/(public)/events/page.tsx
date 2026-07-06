import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { FilterSidebar } from "@/components/events/filter-sidebar";
import { SortControl } from "@/components/events/sort-control";
import { EventsTableView } from "@/components/events/events-table-view";
import { DataSourceProvider } from "@/components/site/data-source-context";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { getEvents } from "@/lib/api";
import { readFiltersFromUrl } from "@/lib/utils";
import { sortEvents, readSortFromParams } from "@/lib/event-sort";
import type { Event, EventFilters } from "@/lib/types";

export const revalidate = 120; // ISR — listings revalidate every 2 min

export const metadata: Metadata = {
  title: "All events",
  description:
    "Everything we&rsquo;ve curated in Dhaka, in one place. Filter by date, neighborhood, category &mdash; or whatever you&rsquo;re up for.",
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
  const filters: EventFilters = readFiltersFromUrl(params);
  const sort = readSortFromParams(params);

  const apiFilters: EventFilters = { ...filters };

  const [eventsRes, totalRes] = await Promise.all([
    getEvents(apiFilters),
    getEvents({}),
  ]);

  const events = eventsRes.data;
  const totalCount = totalRes.data.length;
  const isFallback = eventsRes.source === "fallback";
  const isListView = filters.view === "list";

  // Group by date for editorial sectioning (only when no date filter applied)
  const grouped = groupByDate(events);
  const canGroup =
    grouped.length > 1 &&
    !filters.date_from &&
    !filters.date_to &&
    !filters.search &&
    !filters.date_preset;

  const heading = getHeading(filters);

  return (
    <DataSourceProvider source={isFallback ? "fallback" : "live"}>
      <PageViewTracker />

      {/* Page header — editorial */}
      <section className="border-b border-rule bg-cream-50">
        <div className="editorial-container py-8 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink-500 md:mb-6">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">All events</span>
          </nav>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <span className="eyebrow">The full list</span>
              <h1 className="mt-3 font-display text-4xl tracking-tight text-balance md:text-display-lg">
                {heading.title}
              </h1>
              {heading.subtitle && (
                <p className="mt-3 max-w-xl text-sm text-ink-500">{heading.subtitle}</p>
              )}
            </div>
            <div className="md:col-span-4 md:col-start-9 md:text-right">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-500">
                {String(events.length).padStart(3, "0")} thing{events.length === 1 ? "" : "s"} on the horizon
              </p>
              <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-400">
                {activeFilterCount(filters) > 0
                  ? `${activeFilterCount(filters)} filter${activeFilterCount(filters) === 1 ? "" : "s"} applied`
                  : "No filters applied"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sort row — sits below page header on mobile, inside FilterSidebar on desktop. */}
      <SortControl current={sort} />

      {/* Filter sidebar + results — desktop renders side-by-side inside FilterSidebar */}
      <Suspense>
        <FilterSidebar
          initialFilters={filters}
          resultCount={events.length}
          totalCount={totalCount}
        >
          {events.length === 0 ? (
            <EmptyState hasFilters={activeFilterCount(filters) > 0} />
          ) : isListView ? (
            <ResultsList events={sortEvents(events, sort)} />
          ) : canGroup ? (
            <div className="space-y-10 md:space-y-12">
              {grouped.map((group) => (
                <div key={group.label}>
                  <div className="mb-4 flex items-baseline gap-4 md:mb-6">
                    <h2 className="font-display text-2xl text-ink">{group.label}</h2>
                    <span className="text-xs text-ink-500 font-mono uppercase tracking-wider">
                      {group.events.length} events
                    </span>
                    <div className="flex-1 hairline" />
                  </div>
                  {/* Mobile: 1-col with horizontal-variant cards for compact scan */}
                  <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.events.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortEvents(events, sort).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </FilterSidebar>
      </Suspense>
    </DataSourceProvider>
  );
}

// Heading adapts to active filters — keeps a conversational brand voice on every page.
function getHeading(f: EventFilters): { title: string; subtitle?: string } {
  if (f.date_preset === "today") {
    return { title: "Wanna go somewhere today?", subtitle: "Everything on for tonight, this afternoon, this morning." };
  }
  if (f.date_preset === "weekend") {
    return { title: "Your weekend, sorted.", subtitle: "Friday through Sunday — picked for craft, clarity, and a good time." };
  }
  if (f.date_preset === "next7") {
    return { title: "The week ahead.", subtitle: "Seven days of curated things to do, sorted by date." };
  }
  if (f.date_preset === "next30") {
    return { title: "The month ahead.", subtitle: "Thirty days of curated things to do, sorted by date." };
  }
  if (f.category) {
    const name = f.category.replace(/-/g, " ");
    return { title: `${name[0].toUpperCase()}${name.slice(1)} in Dhaka.` };
  }
  if (f.sub_area) {
    return { title: `What’s happening in ${f.sub_area}.` };
  }
  if (f.audience_tag) {
    return { title: "Curated for you.", subtitle: `Filtered by audience: ${f.audience_tag.replace(/-/g, " ")}.` };
  }
  if (f.search) {
    return { title: `Results for “${f.search}”.` };
  }
  return { title: "Everything we’ve curated, live now." };
}

function ResultsList({ events }: { events: Event[] }) {
  return <EventsTableView events={events} />;
}

function activeFilterCount(f: EventFilters): number {
  return Object.entries(f).filter(
    ([k, v]) => v !== undefined && v !== false && v !== "" && v !== "all" && k !== "view",
  ).length;
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
        {hasFilters ? "Hmm &mdash; nothing matches those filters." : "Quiet week. Check back soon."}
      </h3>
      <p className="mt-3 max-w-md text-ink-500 leading-relaxed">
        {hasFilters
          ? "Try widening the net &mdash; drop a category, a neighborhood, or a date, and see what turns up."
          : "New curated events land every week. In the meantime, peek at the Friday dispatch."}
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