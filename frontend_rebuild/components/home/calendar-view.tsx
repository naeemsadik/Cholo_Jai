"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SectionMobileSheet } from "@/components/mobile/section-sheet";
import { cn, formatPrice, formatTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/client";
import { localizeEvent } from "@/lib/i18n/event";
import type { Event } from "@/lib/types";

interface CalendarViewProps {
  events: Event[];
}

// Month-grid calendar. Each day-cell shows a small dot if any events land on
// that date; clicking opens a dialog listing them. Keyboard: ←/→ to change month,
// Enter on a focused date to open.
export function CalendarView({ events }: CalendarViewProps) {
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const today = React.useMemo(() => {
    return parseIsoDate(dhakaTodayIso());
  }, []);

  const viewMonth = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [today, monthOffset]);

  // Build a YYYY-MM-DD -> events[] index for fast lookup
  const byDate = React.useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const e of events) {
      if (e.status !== "published") continue;
      // Multi-day events span across days
      const start = e.start_date;
      const end = e.end_date ?? e.start_date;
      let cursor = parseIsoDate(start);
      const last = parseIsoDate(end);
      let guard = 0;
      while (cursor <= last && guard++ < 60) {
        const key = cursor.toISOString().slice(0, 10);
        (map[key] ??= []).push(e);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? byDate[selectedDate] ?? [] : [];

  const monthLabel = viewMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // Calendar grid math
  const firstDay = new Date(viewMonth);
  firstDay.setDate(1);
  const startWeekday = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate();

  const cells: Array<{ date: Date | null; iso: string | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null, iso: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
    cells.push({ date: dt, iso: dt.toISOString().slice(0, 10) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, iso: null });

  const todayIso = today.toISOString().slice(0, 10);
  const totalThisMonth = cells.reduce((sum, c) => sum + (c.iso && byDate[c.iso] ? 1 : 0), 0);

  return (
    <section className="border-b border-rule bg-cream-50">
      <div className="editorial-container py-12 md:py-24">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          {/* Left — copy + month controls */}
          <div className="md:col-span-4">
            <span className="eyebrow">By date</span>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-balance md:text-display-md">
              Pick a day. Find what&rsquo;s on.
            </h2>
            <p className="mt-3 hidden max-w-md text-sm text-ink-500 leading-relaxed md:block">
              Spotted a free Saturday? Tap any day with a marker to see exactly what&rsquo;s
              happening &mdash; workshops, talks, a little weekend market.
            </p>

            {/* Month controls — visible on both mobile and desktop */}
            <div className="mt-6 flex items-center gap-2 md:mt-8">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous month"
                onClick={() => setMonthOffset((o) => o - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <div className="flex-1 text-center">
                <p className="font-display text-lg tracking-tight text-ink md:text-xl">
                  {monthLabel}
                </p>
                <p className="mt-1 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500">
                  {totalThisMonth} day{totalThisMonth === 1 ? "" : "s"} with events
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next month"
                onClick={() => setMonthOffset((o) => o + 1)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500 md:mt-6 md:flex-col md:items-start md:gap-2">
              <button
                type="button"
                onClick={() => setMonthOffset(0)}
                className="inline-flex items-center gap-1 font-medium text-ink hover:text-accent-700 transition-colors"
              >
                <CalendarIcon className="h-3 w-3" aria-hidden />
                Jump to today
              </button>
              <Link
                href="/events"
                className="inline-flex items-center gap-1 font-medium text-ink hover:text-accent-700 transition-colors"
              >
                See full listing →
              </Link>
            </div>
          </div>

          {/* Right — calendar grid (rendered inline on both mobile and desktop) */}
          <div className="md:col-span-8">
            <div className="rounded-lg border border-rule bg-paper shadow-paper overflow-hidden">
              {/* Weekday header */}
              <div
                role="row"
                className="grid grid-cols-7 border-b border-rule bg-cream-100"
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                  <div
                    key={w}
                    role="columnheader"
                    aria-label={w}
                    className="px-1 py-2 text-center text-[0.6rem] font-mono uppercase tracking-[0.12em] text-ink-500 sm:px-2 sm:py-2.5 sm:text-[0.65rem] sm:tracking-[0.18em]"
                  >
                    {w}
                  </div>
                ))}
              </div>
              {/* Days */}
              <div role="grid" className="grid grid-cols-7">
                {cells.map((c, i) => {
                  if (!c.date || !c.iso) {
                    return (
                      <div
                        key={i}
                        aria-hidden
                        className="aspect-square border-b border-r border-rule bg-cream-50/50"
                      />
                    );
                  }
                  const eventsToday = byDate[c.iso] ?? [];
                  const isToday = c.iso === todayIso;
                  const isPast = c.iso < todayIso;
                  return (
                  <DayCell
                    key={c.iso}
                    iso={c.iso}
                      day={c.date.getDate()}
                      count={eventsToday.length}
                      isToday={isToday}
                      isPast={isPast}
                      onSelect={() => setSelectedDate(c.iso)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend / inline hint on mobile */}
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500 md:hidden">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
              <span>Day with curated events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                parseIsoDate(selectedDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
            </DialogTitle>
            <DialogDescription>
              {selectedEvents.length === 0
                ? "No events on this day."
                : `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"} on this day.`}
            </DialogDescription>
          </DialogHeader>

          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CalendarIcon className="h-8 w-8 text-ink-300" aria-hidden />
              <p className="text-sm text-ink-500">
                Pick another day to see what&rsquo;s on.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
                Close
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedEvents.map((e) => (
                <li key={e.id}>
                  <DayEventRow event={e} />
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function DayCell({
  iso,
  day,
  count,
  isToday,
  isPast,
  onSelect,
}: {
  iso: string;
  day: number;
  count: number;
  isToday: boolean;
  isPast: boolean;
  onSelect: () => void;
}) {
  const hasEvents = count > 0;
  return (
    <button
      type="button"
      role="gridcell"
      aria-label={
        parseIsoDate(iso).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }) +
        (hasEvents ? `, ${count} event${count === 1 ? "" : "s"}` : ", no events")
      }
      onClick={onSelect}
      disabled={isPast}
      className={cn(
        "relative aspect-square border-b border-r border-rule text-left transition-all",
        "flex flex-col items-start justify-between p-1.5 sm:p-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500",
        isPast && "bg-cream-50/50 text-ink-300 cursor-not-allowed",
        !isPast && !hasEvents && "bg-paper text-ink-500 hover:bg-cream-100 cursor-pointer",
        !isPast && hasEvents && "bg-paper text-ink hover:bg-cream-100 cursor-pointer",
        isToday && "bg-accent-50 hover:bg-accent-100",
      )}
    >
      <span
        className={cn(
          "font-display text-sm leading-none sm:text-base tabular-nums",
          isToday && "font-semibold text-accent-700",
          hasEvents && !isToday && "text-ink",
        )}
      >
        {day}
      </span>
      {hasEvents && (
        <span
          aria-hidden
          className="flex items-center gap-0.5 self-end"
        >
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                isToday ? "bg-accent-700" : "bg-ember",
              )}
            />
          ))}
          {count > 3 && (
            <span className="ml-1 text-[0.55rem] font-mono tabular-nums text-ink-500">
              +{count - 3}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

function dhakaTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function DayEventRow({ event }: { event: Event }) {
  const locale = useLocale();
  const l = localizeEvent(event, locale);
  const isFree = event.price_type === "free";
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-3 rounded-lg border border-rule bg-paper p-3 transition-all hover:border-ink-300 hover:shadow-paper"
    >
      <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded bg-cream-200 sm:block">
        <Image
          src={event.poster_url}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-mono uppercase tracking-[0.15em] text-ink-500">
          <span>{formatTime(event.start_time, locale)}</span>
          <span aria-hidden>·</span>
          <span>{event.sub_area}</span>
          {isFree && (
            <>
              <span aria-hidden>·</span>
              <Badge variant="muted" className="font-mono">Free</Badge>
            </>
          )}
        </div>
        <h4 className="mt-1 font-display text-base leading-snug text-ink group-hover:text-accent-700 transition-colors line-clamp-2">
          {l.title}
        </h4>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="h-3 w-3" aria-hidden />
          <span className="line-clamp-1">{l.venue_name}</span>
        </div>
      </div>
      <div className="self-center">
        <Badge variant="outline" className="font-mono">
          {formatPrice(event.price_type, event.price_note, locale)}
        </Badge>
      </div>
    </Link>
  );
}
