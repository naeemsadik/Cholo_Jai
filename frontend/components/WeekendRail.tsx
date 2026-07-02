"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EventItem } from "@/lib/types";
import { formatTime, clsx, dayMonth } from "@/lib/util";

export function WeekendRail({ events }: { events: EventItem[] }) {
  const weekend = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.start_date).getDay();
      return d === 5 || d === 6 || d === 0;
    }).slice(0, 10);
  }, [events]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-14 md:py-20">
      <div className="grid grid-cols-12 gap-6 items-end mb-8 md:mb-10">
        <div className="col-span-12 md:col-span-7">
          <div className="section-eyebrow mb-3">// SECTION 03 · WEEKEND FORECAST</div>
          <h2 className="font-display text-huge tracking-tight kern-tight">
            FRIDAY → SUNDAY.<br />
            <span className="text-hazard">PACK A LIGHT BAG.</span>
          </h2>
        </div>
        <div className="col-span-12 md:col-span-5 md:text-right">
          <p className="font-serif text-ink/80 max-w-md md:ml-auto text-[15px]">
            Weekend at a glance — the events we&rsquo;d actually clear our calendar for.
            Sorted by date, tap any to see the full listing.
          </p>
        </div>
      </div>

      <div className="border-2 border-ink bg-paper">
        <div className="grid grid-cols-12 gap-0 bg-ink text-bone font-mono text-[10px] uppercase tracking-[0.22em]">
          <div className="col-span-1 px-3 py-3 border-r border-bone/30">№</div>
          <div className="col-span-2 px-3 py-3 border-r border-bone/30 hidden md:block">Date</div>
          <div className="col-span-6 md:col-span-4 px-3 py-3 border-r border-bone/30">Listing</div>
          <div className="col-span-3 px-3 py-3 border-r border-bone/30 hidden md:block">Sector</div>
          <div className="col-span-3 px-3 py-3">Type</div>
        </div>

        <div className="font-mono">
          {weekend.map((ev, i) => (
            <Link
              key={ev.id}
              href={`/events/${ev.slug}`}
              className="grid grid-cols-12 gap-0 border-t-2 border-ink hover:bg-bone transition-colors items-center"
            >
              <div className="col-span-1 px-3 py-3 border-r border-ink/30 font-display text-xl">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="col-span-2 px-3 py-3 border-r border-ink/30 hidden md:block uppercase tracking-[0.16em] text-[12px]">
                {dayMonth(ev.start_date).mon} · {dayMonth(ev.start_date).day}
              </div>
              <div className="col-span-12 md:col-span-4 px-3 py-3 border-r border-ink/30 font-display text-lg md:text-xl leading-tight tracking-tight">
                {ev.title}
                <div className="md:hidden text-[11px] font-mono uppercase tracking-[0.16em] mt-1 text-ink/70">
                  {ev.sub_area} · {formatTime(ev.start_time)}
                </div>
              </div>
              <div className="col-span-3 px-3 py-3 border-r border-ink/30 hidden md:block uppercase tracking-[0.16em] text-[12px]">
                {ev.sub_area.toUpperCase()}
              </div>
              <div className="col-span-6 md:col-span-3 px-3 py-3 flex items-center justify-between">
                <span className={clsx(
                  "chip",
                  ev.price_type === "free" ? "chip-hazard" : "chip-ink"
                )}>
                  {ev.price_type === "free" ? "● FREE" : "◐ PAID"}
                </span>
                <span className="text-hazard text-lg">→</span>
              </div>
            </Link>
          ))}
          {weekend.length === 0 && (
            <div className="p-8 text-center font-mono uppercase tracking-[0.2em] text-[12px] text-ink/60">
              No weekend events logged this week. Check back Friday.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}