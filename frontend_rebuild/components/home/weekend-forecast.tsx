import Link from "next/link";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HorizontalSnap } from "@/components/mobile/horizontal-snap";
import { cn, formatEventDate, isWeekendDate } from "@/lib/utils";
import type { Event } from "@/lib/types";

// "Weekend forecast" — the editorial pick for what's happening Fri–Sun
export function WeekendForecast({ events }: { events: Event[] }) {
  const today = new Date();
  const next = new Date(today);
  next.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const weekendEnd = new Date(next);
  weekendEnd.setDate(next.getDate() + 2);

  const upcoming = events
    .filter((e) => isWeekendDate(e.start_date))
    .filter((e) => {
      const d = new Date(e.start_date);
      return d >= today && d <= weekendEnd;
    })
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-12 md:py-20">
        <div className="mb-6 flex flex-col gap-4 px-4 md:mb-10 md:flex-row md:items-end md:justify-between md:px-0">
          <div>
            <span className="eyebrow">The Weekend Forecast</span>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-balance md:text-display-md">
              Your next <span className="italic">three days off</span> &mdash; sorted.
            </h2>
            <p className="mt-3 hidden max-w-md text-sm text-ink-500 leading-relaxed md:block">
              Friday through Sunday, picked for craft, good people, and a reason to leave
              the house.
            </p>
          </div>
          <Link
            href="/events?weekend=true"
            className="group inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors"
          >
            <span>See the full weekend</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile carousel */}
        <HorizontalSnap ariaLabel="This weekend" itemWidth="min(85%, 320px)" showProgress>
          {upcoming.map((e) => (
            <WeekendCell key={e.id} event={e} />
          ))}
        </HorizontalSnap>

        {/* Desktop grid */}
        <div className="hidden gap-px overflow-hidden rounded-lg border border-rule bg-rule md:grid md:grid-cols-3">
          {upcoming.map((e) => (
            <WeekendCell key={e.id} event={e} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WeekendCell({ event }: { event: Event }) {
  const day = new Date(event.start_date);
  const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long" });
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-rule bg-paper p-5 transition-colors hover:border-ink-300 hover:bg-cream-50 md:rounded-none md:border-0 md:p-7"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className="shrink-0 font-mono text-[0.6rem]">
          {dayLabel.toUpperCase()}
        </Badge>
        <span className="truncate text-right font-mono text-[0.6rem] uppercase tracking-wider text-ink-500 md:text-[0.65rem]">
          {formatEventDate(event.start_date, event.start_time)}
        </span>
      </div>
      <h3 className="mt-6 break-words font-display text-xl leading-tight tracking-tight text-ink group-hover:text-accent-700 transition-colors text-balance md:mt-8 md:text-2xl">
        {event.title}
      </h3>
      <p className="mt-3 line-clamp-3 break-words text-sm text-ink-500">
        {event.description}
      </p>
      <div className="mt-auto flex items-center gap-1.5 pt-6 text-xs text-ink-700">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{event.venue_name}, {event.sub_area}</span>
      </div>
      <div
        className={cn(
          "mt-4 inline-flex items-center self-start whitespace-nowrap rounded-sm px-2 py-1 font-mono text-[0.6rem] uppercase tracking-wider md:text-[0.65rem]",
          event.price_type === "free"
            ? "bg-accent-50 text-accent-700"
            : "bg-cream-200 text-ink-700",
        )}
      >
        {event.price_type === "free" ? "Free entry" : event.price_note || "Paid"}
      </div>
    </Link>
  );
}