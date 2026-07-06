import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { HorizontalSnap } from "@/components/mobile/horizontal-snap";
import type { Event } from "@/lib/types";

export function UpcomingGrid({ events }: { events: Event[] }) {
  const items = events.slice(0, 9);
  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-12 md:py-20">
        <div className="mb-6 flex items-end justify-between gap-6 px-4 md:mb-10 md:px-0">
          <div>
            <span className="eyebrow">Coming up</span>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-balance md:text-display-md">
              {events.length} things on the horizon.
            </h2>
            <p className="mt-2 hidden max-w-md text-sm text-ink-500 md:block">
              Click around. We&rsquo;ve checked these &mdash; the venue, the organizer, the lot.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors"
          >
            See everything
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile carousel — keeps visuals compact */}
        <HorizontalSnap ariaLabel="Upcoming events" itemWidth="min(85%, 320px)" showProgress>
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </HorizontalSnap>

        {/* Desktop grid */}
        <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700"
          >
            See everything
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}