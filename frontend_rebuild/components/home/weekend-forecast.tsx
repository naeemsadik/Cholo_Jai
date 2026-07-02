import Link from "next/link";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="editorial-container py-16 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">The Weekend Forecast</span>
            <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
              This weekend, in and around Dhaka.
            </h2>
          </div>
          <Link
            href="/events?weekend=true"
            className="group inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700 transition-colors"
          >
            <span>Full weekend calendar</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule md:grid-cols-3">
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
      className="group relative flex flex-col bg-paper p-7 transition-colors hover:bg-cream-50"
    >
      <div className="flex items-start justify-between">
        <Badge variant="outline" className="font-mono">
          {dayLabel.toUpperCase()}
        </Badge>
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-500">
          {formatEventDate(event.start_date, event.start_time)}
        </span>
      </div>
      <h3 className="mt-8 font-display text-2xl leading-tight tracking-tight text-ink group-hover:text-accent-700 transition-colors text-balance">
        {event.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm text-ink-500">
        {event.description}
      </p>
      <div className="mt-auto pt-6 flex items-center gap-1.5 text-xs text-ink-700">
        <MapPin className="h-3 w-3" />
        <span>{event.venue_name}, {event.sub_area}</span>
      </div>
      <div
        className={cn(
          "mt-4 inline-flex items-center self-start rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
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