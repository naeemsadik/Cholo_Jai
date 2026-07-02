"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EventItem } from "@/lib/types";
import { formatTime, clsx } from "@/lib/util";

export function WeekendForecast({ events }: { events: EventItem[] }) {
  const weekend = useMemo(() => {
    return events
      .filter((e) => {
        const d = new Date(e.start_date).getDay();
        return d === 5 || d === 6 || d === 0;
      })
      .slice(0, 7);
  }, [events]);

  return (
    <section className="bg-ink text-ivory relative">
      <div className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24">
        <header className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow !text-ivory before:bg-accent mb-4">
              Section 03 — Weekend forecast
            </div>
            <h2 className="t-huge">
              Friday to Sunday.<br />
              <span className="font-serif italic text-accent">Pack a light bag.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 flex md:items-end">
            <p className="font-serif text-lg text-ivory/85 max-w-md">
              The events we&rsquo;d actually clear our calendar for. Sorted by date —
              tap any to see the full listing.
            </p>
          </div>
        </header>

        {weekend.length === 0 ? (
          <div className="border border-ivory/20 p-12 text-center font-mono uppercase tracking-[0.2em] text-[12px] text-ivory/60">
            No weekend events logged this week.
          </div>
        ) : (
          <div className="border border-ivory/30 overflow-x-auto">
            <table className="btable !border-ivory/30">
              <thead>
                <tr>
                  <th className="!bg-paper !text-ink !border-paper">№</th>
                  <th className="!bg-paper !text-ink !border-paper">Date</th>
                  <th className="!bg-paper !text-ink !border-paper">Listing</th>
                  <th className="!bg-paper !text-ink !border-paper hidden md:table-cell">Sector</th>
                  <th className="!bg-paper !text-ink !border-paper hidden lg:table-cell">Time</th>
                  <th className="!bg-paper !text-ink !border-paper">Type</th>
                  <th className="!bg-paper !text-ink !border-paper"></th>
                </tr>
              </thead>
              <tbody>
                {weekend.map((ev, i) => {
                  const d = new Date(ev.start_date);
                  return (
                    <tr key={ev.id}>
                      <td className="!bg-ink !text-ivory font-display text-lg">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="!bg-ink !text-ivory/85">
                        {d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                      </td>
                      <td className="!bg-ink !text-ivory font-display">
                        <Link href={`/events/${ev.slug}`} className="hover:text-accent transition-colors">
                          {ev.title}
                        </Link>
                      </td>
                      <td className="!bg-ink !text-ivory/85 hidden md:table-cell">
                        {ev.sub_area}
                      </td>
                      <td className="!bg-ink !text-ivory/85 hidden lg:table-cell font-mono text-xs">
                        {formatTime(ev.start_time)}
                      </td>
                      <td className="!bg-ink !text-ivory">
                        <span
                          className={clsx(
                            "chip",
                            ev.price_type === "free"
                              ? "chip-accent"
                              : "!bg-ivory/10 !text-ivory !border-ivory/30"
                          )}
                        >
                          {ev.price_type === "free" ? "● Free" : "◐ Paid"}
                        </span>
                      </td>
                      <td className="!bg-ink !text-ivory text-accent text-right">
                        <Link href={`/events/${ev.slug}`} aria-label={`View ${ev.title}`}>
                          →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ivory/60">
          <span>Showing {String(weekend.length).padStart(2, "0")} of upcoming weekend events</span>
          <Link href="/events?filter=weekend" className="text-accent hover:underline">
            View all weekend →
          </Link>
        </div>
      </div>
    </section>
  );
}