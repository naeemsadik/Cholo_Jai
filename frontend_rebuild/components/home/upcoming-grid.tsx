import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import type { Event } from "@/lib/types";

export function UpcomingGrid({ events }: { events: Event[] }) {
  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-16 md:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Coming up</span>
            <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
              {events.length} curated events on the horizon.
            </h2>
          </div>
          <Link
            href="/events"
            className="group hidden md:inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700 transition-colors"
          >
            View all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 9).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700"
          >
            View all events
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}