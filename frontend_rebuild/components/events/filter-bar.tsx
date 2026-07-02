"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { SelectChip } from "@/components/ui/badge-chip";
import { CATEGORIES, AUDIENCE_TAGS, SUB_AREAS_DHAKA, CITIES } from "@/lib/categories";
import type { EventFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  initialFilters: EventFilters;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({ initialFilters, resultCount, totalCount }: FilterBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [filters, setFilters] = React.useState<EventFilters>(initialFilters);
  const [searchInput, setSearchInput] = React.useState(initialFilters.search ?? "");

  const updateUrl = React.useCallback(
    (next: EventFilters) => {
      const p = new URLSearchParams();
      if (next.city) p.set("city", next.city);
      if (next.sub_area) p.set("sub_area", next.sub_area);
      if (next.category) p.set("category", next.category);
      if (next.audience_tag) p.set("audience_tag", next.audience_tag);
      if (next.date_from) p.set("from", next.date_from);
      if (next.date_to) p.set("to", next.date_to);
      if (next.weekend) p.set("weekend", "true");
      if (next.search) p.set("q", next.search);
      if (next.featured) p.set("featured", "true");
      if (next.price_type && next.price_type !== "all") p.set("price", next.price_type);
      const qs = p.toString();
      router.replace(qs ? `/events?${qs}` : "/events", { scroll: false });
    },
    [router],
  );

  function update<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    updateUrl(next);
  }

  function toggleCategory(slug: string) {
    update("category", filters.category === slug ? undefined : slug);
  }
  function toggleTag(slug: string) {
    update("audience_tag", filters.audience_tag === slug ? undefined : slug);
  }
  function toggleSubArea(name: string) {
    update("sub_area", filters.sub_area === name ? undefined : name);
  }
  function toggleCity(city: string) {
    update("city", filters.city === city ? undefined : city);
  }
  function clearAll() {
    setFilters({});
    setSearchInput("");
    router.replace("/events", { scroll: false });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    update("search", searchInput || undefined);
  }

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== false && v !== "" && v !== "all",
  ).length;

  return (
    <div className="border-b border-rule bg-cream-50">
      <div className="editorial-container py-6">
        {/* Search + controls row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                type="search"
                placeholder="Search events, venues, or areas…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-11 pl-10 bg-paper"
                aria-label="Search events"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <p className="hidden sm:block text-xs text-ink-500 font-mono uppercase tracking-wider">
              <span className="text-ink-900 font-semibold">{resultCount}</span> / {totalCount} events
            </p>
            {/* Mobile filter trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="md" className="md:hidden relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[0.65rem] font-mono text-paper">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto px-0">
                <div className="px-6 pb-6">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine by location, date, and category.</SheetDescription>
                  </SheetHeader>
                </div>
                <div className="px-6 space-y-8 pb-8">
                  <FilterSections
                    filters={filters}
                    onCity={toggleCity}
                    onSubArea={toggleSubArea}
                    onCategory={toggleCategory}
                    onTag={toggleTag}
                    onWeekend={(v) => update("weekend", v)}
                    onFeatured={(v) => update("featured", v)}
                    onPrice={(v) => update("price_type", v)}
                    onFree={(v) => update("price_type", v ? "free" : "all")}
                  />
                  <div className="flex gap-2 pt-4 border-t border-rule">
                    <Button variant="ghost" onClick={clearAll} className="flex-1">Clear all</Button>
                    <SheetClose asChild>
                      <Button variant="primary" className="flex-1">Show {resultCount} events</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop filter chips row — City + Categories quick select */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1 hidden md:inline">Quick</span>
          <SelectChip active={!filters.city} onClick={() => update("city", undefined)}>
            All cities
          </SelectChip>
          {CITIES.map((c) => (
            <SelectChip
              key={c}
              active={filters.city === c}
              onClick={() => update("city", filters.city === c ? undefined : c)}
            >
              {c}
            </SelectChip>
          ))}
          <span className="hidden md:inline-block mx-2 h-5 w-px bg-rule" />
          <SelectChip active={filters.weekend === true} onClick={() => update("weekend", filters.weekend ? undefined : true)}>
            Weekend
          </SelectChip>
          <SelectChip active={filters.featured === true} onClick={() => update("featured", filters.featured ? undefined : true)}>
            Featured
          </SelectChip>
          <SelectChip active={filters.price_type === "free"} onClick={() => update("price_type", filters.price_type === "free" ? undefined : "free")}>
            Free entry
          </SelectChip>
        </div>

        {/* Active filter pills — show what's applied */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="eyebrow">Applied</span>
            {filters.search && (
              <ActivePill label={`"${filters.search}"`} onClear={() => { setSearchInput(""); update("search", undefined); }} />
            )}
            {filters.city && <ActivePill label={`City: ${filters.city}`} onClear={() => update("city", undefined)} />}
            {filters.sub_area && <ActivePill label={`Area: ${filters.sub_area}`} onClear={() => update("sub_area", undefined)} />}
            {filters.category && <ActivePill label={`Category: ${categoryName(filters.category)}`} onClear={() => update("category", undefined)} />}
            {filters.audience_tag && <ActivePill label={`Tag: ${tagName(filters.audience_tag)}`} onClear={() => update("audience_tag", undefined)} />}
            {filters.weekend && <ActivePill label="Weekend only" onClear={() => update("weekend", undefined)} />}
            {filters.featured && <ActivePill label="Featured only" onClear={() => update("featured", undefined)} />}
            {filters.price_type && filters.price_type !== "all" && <ActivePill label={`Price: ${filters.price_type}`} onClear={() => update("price_type", "all")} />}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-ink-500 underline-offset-4 hover:text-ink hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivePill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper hover:bg-ink-700 transition-colors"
    >
      <span>{label}</span>
      <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
    </button>
  );
}

function FilterSections({
  filters,
  onCity,
  onSubArea,
  onCategory,
  onTag,
  onWeekend,
  onFeatured,
  onPrice,
  onFree,
}: {
  filters: EventFilters;
  onCity: (s: string) => void;
  onSubArea: (s: string) => void;
  onCategory: (s: string) => void;
  onTag: (s: string) => void;
  onWeekend: (v: boolean | undefined) => void;
  onFeatured: (v: boolean | undefined) => void;
  onPrice: (v: "free" | "paid" | "all" | undefined) => void;
  onFree: (v: boolean) => void;
}) {
  return (
    <div className="space-y-8">
      <FilterSection title="When">
        <div className="space-y-3">
          <Checkbox
            checked={filters.weekend === true}
            onChange={(e) => onWeekend(e.target.checked ? true : undefined)}
            label="Weekend only (Fri–Sun)"
          />
          <Checkbox
            checked={filters.featured === true}
            onChange={(e) => onFeatured(e.target.checked ? true : undefined)}
            label="Featured only"
          />
        </div>
      </FilterSection>

      <FilterSection title="City">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <SelectChip
              key={c}
              active={filters.city === c}
              onClick={() => onCity(c)}
            >
              {c}
            </SelectChip>
          ))}
        </div>
      </FilterSection>

      {filters.city === "Dhaka" && (
        <FilterSection title="Sub-area in Dhaka">
          <div className="flex flex-wrap gap-2">
            {SUB_AREAS_DHAKA.map((a) => (
              <SelectChip
                key={a}
                active={filters.sub_area === a}
                onClick={() => onSubArea(a)}
              >
                {a}
              </SelectChip>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <SelectChip
              key={c.slug}
              active={filters.category === c.slug}
              onClick={() => onCategory(c.slug)}
            >
              {c.name}
            </SelectChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Audience tags">
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_TAGS.map((t) => (
            <SelectChip
              key={t.slug}
              active={filters.audience_tag === t.slug}
              onClick={() => onTag(t.slug)}
            >
              {t.name}
            </SelectChip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Cost">
        <div className="space-y-3">
          <Checkbox
            checked={filters.price_type === "free"}
            onChange={(e) => onFree(e.target.checked)}
            label="Free entry only"
          />
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </div>
  );
}

function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
function tagName(slug: string) {
  return AUDIENCE_TAGS.find((t) => t.slug === slug)?.name ?? slug;
}