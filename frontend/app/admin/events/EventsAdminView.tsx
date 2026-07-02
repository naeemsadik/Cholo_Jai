"use client";

import Link from "next/link";
import { useState } from "react";
import { fallbackEvents } from "@/lib/fallback-data";
import { dayMonth, clsx } from "@/lib/util";

const statusColor: Record<string, string> = {
  published: "pill-live",
  draft: "pill",
  archived: "pill",
  rejected: "pill-accent",
};

export function EventsAdminView() {
  const [filter, setFilter] = useState<"all" | "featured" | "draft" | "archived">("all");

  const filtered = fallbackEvents.filter((e) => {
    if (filter === "all") return true;
    if (filter === "featured") return !!e.is_featured;
    if (filter === "draft") return e.status === "draft";
    if (filter === "archived") return e.status === "archived";
    return true;
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Events</div>
          <h1 className="t-huge tracking-tighter">
            Manage<br />
            <span className="font-serif italic text-accent">events.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-3 flex md:justify-end">
          <button className="btn-accent">＋ New event</button>
        </div>
      </header>

      <div className="flex items-center gap-px bg-ink border border-ink" role="tablist">
        {(["all", "featured", "draft", "archived"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={clsx(
              "h-10 px-4 font-mono uppercase tracking-[0.18em] text-[11px] border-r border-ink last:border-r-0 focus-ring",
              filter === k ? "bg-paper text-ink" : "bg-ink text-ivory hover:bg-paper/10"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="border border-ink overflow-x-auto">
        <table className="btable">
          <thead>
            <tr>
              <th>№</th>
              <th>Listing</th>
              <th>Sector</th>
              <th>Date</th>
              <th>Type</th>
              <th>Outbound</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, i) => (
              <tr key={ev.id}>
                <td className="font-display">{String(i + 1).padStart(2, "0")}</td>
                <td className="font-display">{ev.title}</td>
                <td>{ev.sub_area}</td>
                <td>{dayMonth(ev.start_date).day} {dayMonth(ev.start_date).mon}</td>
                <td>{ev.price_type.toUpperCase()}</td>
                <td className="truncate max-w-[14ch]">{ev.outbound_button_label}</td>
                <td>
                  <span className={clsx("pill", statusColor[ev.status] || "pill-live")}>
                    <span className="dot" />
                    {ev.status.toUpperCase()}
                  </span>
                  {ev.is_featured && (
                    <span className="chip-accent ml-2">★</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                    <Link href={`/admin/events/${ev.slug}`} className="link-accent">Edit</Link>
                    <span className="opacity-40">/</span>
                    <button className="text-accent hover:underline">Unpublish</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}