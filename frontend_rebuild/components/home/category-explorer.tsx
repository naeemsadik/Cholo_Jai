"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  GraduationCap,
  Users,
  Baby,
  Sun,
  Music,
  Image as ImageIcon,
  UtensilsCrossed,
  Trophy,
  Moon,
  Gift,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import type { Event } from "@/lib/types";

// Editorial category tile grid — parallel to SectorExplorer.
// Each tile shows a category name, an icon, and a live upcoming-events count.
// Tiles with 0 events are hidden so the grid is always meaningful.
//
// Compact grid (not a horizontal scroll). Same on mobile and desktop —
// mobile gets a 2-col layout, just tighter spacing.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  workshops: Sparkles,
  seminars: Mic,
  "university-events": GraduationCap,
  "student-events": Users,
  "family-events": Baby,
  "weekend-events": Sun,
  concerts: Music,
  exhibitions: ImageIcon,
  "food-events": UtensilsCrossed,
  sports: Trophy,
  "islamic-community": Moon,
  "free-events": Gift,
};

interface CategoryExplorerProps {
  events: Event[];
}

// Hand-curated editorial order — reflects how a Dhaka reader would think about
// categories, not alphabetical.
const CATEGORY_ORDER = [
  "workshops",
  "seminars",
  "concerts",
  "exhibitions",
  "weekend-events",
  "free-events",
  "family-events",
  "food-events",
  "sports",
  "university-events",
  "student-events",
  "islamic-community",
];

export function CategoryExplorer({ events }: CategoryExplorerProps) {
  // Count upcoming published events per category.
  const counts = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const c: Record<string, number> = {};
    for (const e of events) {
      if (e.status !== "published") continue;
      if (e.start_date < today) continue;
      for (const cat of e.categories) {
        c[cat] = (c[cat] ?? 0) + 1;
      }
    }
    return c;
  }, [events]);

  // Editorial order; filter to categories with ≥1 event.
  const tiles = CATEGORY_ORDER.filter((slug) => (counts[slug] ?? 0) > 0).map((slug) => {
    const cat = CATEGORIES.find((c) => c.slug === slug);
    return { slug, name: cat?.name ?? slug, count: counts[slug] };
  });

  if (tiles.length === 0) return null;

  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-12 md:py-24">
        <div className="mb-6 flex items-end justify-between gap-6 px-4 md:mb-10 md:px-0">
          <div>
            <span className="eyebrow">By mood</span>
            <h2 className="mt-3 font-display text-2xl tracking-tight text-balance md:text-display-md">
              What are you up for?
            </h2>
            <p className="mt-2 hidden max-w-xl text-sm text-ink-500 md:block">
              Twelve ways to spend a day &mdash; from a quiet evening with chai to a rooftop you&rsquo;ve never tried.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-600 transition-colors"
          >
            See everything
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Compact grid — same on mobile and desktop.
            Mobile: 2 cols. Tablet: 3 cols. Desktop: 4 cols. */}
        <div
          className={cn(
            "grid gap-2 px-4 md:gap-px md:overflow-hidden md:rounded-lg md:border md:border-rule md:bg-rule md:px-0",
            "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
          )}
        >
          {tiles.map((t) => (
            <CategoryTile key={t.slug} slug={t.slug} name={t.name} count={t.count} />
          ))}
        </div>

        {/* Mobile-only secondary "all categories" link */}
        <div className="mt-4 px-4 md:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700 transition-colors"
          >
            All categories
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryTile({
  slug,
  name,
  count,
}: {
  slug: string;
  name: string;
  count: number;
}) {
  const Icon = CATEGORY_ICONS[slug] ?? Sparkles;
  return (
    <Link
      href={`/events?category=${slug}`}
      className={cn(
        "group relative flex aspect-[5/3] h-full w-full min-w-0 flex-col justify-between overflow-hidden rounded-md border border-rule bg-paper p-4 transition-all hover:border-ink-300 hover:bg-cream-100 md:rounded-none md:border-0 md:p-5",
        "cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-5 w-5 shrink-0 text-ink-500 transition-colors group-hover:text-ink md:h-6 md:w-6" aria-hidden />
        <span className="text-[0.6rem] font-mono uppercase tracking-[0.18em] text-ink-400 tabular-nums md:text-[0.65rem]">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <div className="min-w-0">
        <h3 className="break-words font-display text-base leading-tight tracking-tight text-ink line-clamp-2 md:text-2xl">
          {name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.65rem] text-ink-500 md:mt-2 md:text-xs">
          <span className="hidden sm:inline">{count} upcoming</span>
          <span className="sm:hidden">{count}</span>
          <ArrowUpRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
