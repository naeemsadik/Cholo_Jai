"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SUB_AREAS_DHAKA_ORDER,
} from "@/lib/categories";
import type { Event } from "@/lib/types";

interface SectorExplorerProps {
  events: Event[];
}

// Compact grid (not a horizontal scroll). Same on mobile and desktop —
// mobile gets the same 2-col layout as desktop, just tighter spacing.
export function SectorExplorer({ events }: SectorExplorerProps) {
  // Count upcoming published events per sub-area — omit zero-count tiles.
  const counts = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const c: Record<string, number> = {};
    for (const e of events) {
      if (e.status !== "published") continue;
      if (e.start_date < today) continue;
      c[e.sub_area] = (c[e.sub_area] ?? 0) + 1;
    }
    return c;
  }, [events]);

  // Editorial order from SUB_AREAS_DHAKA_ORDER; filter to areas with >=1 event.
  const tiles = SUB_AREAS_DHAKA_ORDER.filter((name) => (counts[name] ?? 0) > 0);

  if (tiles.length === 0) return null;

  return (
    <section className="border-b border-rule bg-cream-50">
      <div className="editorial-container py-12 md:py-24">
        <div className="mb-6 flex items-end justify-between gap-6 px-4 md:mb-10 md:px-0">
          <div>
            <span className="eyebrow">By area</span>
            <h2 className="mt-3 font-display text-2xl tracking-tight text-balance md:text-display-md">
              Where to, friend?
            </h2>
            <p className="mt-2 hidden max-w-xl text-sm text-ink-500 md:block">
              Pick a neighborhood &mdash; we&rsquo;ll show you what&rsquo;s happening there.
            </p>
          </div>
        </div>

        {/* Compact grid — same shape on mobile and desktop.
            Mobile: 2 cols. Tablet: 3 cols. Desktop: 4 cols. */}
        <div
          className={cn(
            "grid gap-2 px-4 md:gap-px md:overflow-hidden md:rounded-lg md:border md:border-rule md:bg-rule md:px-0",
            "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {tiles.map((name) => (
            <SectorTile key={name} name={name} count={counts[name]} />
          ))}
          <BrowseAllTile />
        </div>
      </div>
    </section>
  );
}

function SectorTile({ name, count }: { name: string; count: number }) {
  return (
    <Link
      href={`/events?sub_area=${encodeURIComponent(name)}`}
      className="group relative flex aspect-[5/3] h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-md border border-rule bg-paper p-4 transition-all hover:border-ink-300 hover:bg-cream-100 md:rounded-none md:border-0 md:p-6"
    >
      <div className="flex items-center gap-2 text-[0.6rem] font-mono uppercase tracking-[0.15em] text-ink-500 md:text-[0.65rem]">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">Sub-area</span>
      </div>
      <div className="min-w-0">
        <h3 className="break-words font-display text-base leading-tight tracking-tight text-ink line-clamp-2 md:text-2xl">
          {name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.65rem] text-ink-500 md:mt-2 md:gap-2 md:text-xs">
          <Badge variant="muted" className="shrink-0 font-mono text-[0.6rem] md:text-[0.65rem]">
            {count}
          </Badge>
          <span className="hidden sm:inline">upcoming</span>
          <ArrowUpRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

function BrowseAllTile() {
  return (
    <Link
      href="/events"
      className="group relative flex aspect-[5/3] h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-md bg-ink p-4 text-paper transition-all hover:bg-ink-700 md:rounded-none md:p-6"
    >
      <div className="flex items-center gap-2 text-[0.6rem] font-mono uppercase tracking-[0.15em] text-paper/60 md:text-[0.65rem]">
        <span className="truncate">Index</span>
      </div>
      <div className="min-w-0">
        <h3 className="break-words font-display text-base leading-tight tracking-tight md:text-2xl">
          Browse all
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.65rem] text-paper/70 md:mt-2 md:gap-2 md:text-xs">
          <span className="truncate">Every curated event</span>
          <ArrowUpRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
