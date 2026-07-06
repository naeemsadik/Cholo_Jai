"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SelectChip } from "@/components/ui/badge-chip";
import { CATEGORIES, AUDIENCE_TAGS, SUB_AREAS_DHAKA, CITIES } from "@/lib/categories";
import { cn, datePresetRange } from "@/lib/utils";
import type { EventFilters } from "@/lib/types";

// ──────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "weekend", label: "This weekend" },
  { value: "next7", label: "Next 7 days" },
  { value: "next30", label: "Next 30 days" },
] as const;

const PRICE_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
] as const;

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
] as const;

// ──────────────────────────────────────────────────────────────────────────
// Public component
// ──────────────────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  initialFilters: EventFilters;
  resultCount: number;
  totalCount: number;
  children?: React.ReactNode; // optional right-column content (toolbar + results)
}

export function FilterSidebar({ initialFilters, resultCount, totalCount, children }: FilterSidebarProps) {
  const router = useRouter();
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
      if (next.date_preset) p.set("when", next.date_preset);
      if (next.weekend) p.set("weekend", "true");
      if (next.search) p.set("q", next.search);
      if (next.featured) p.set("featured", "true");
      if (next.price_type && next.price_type !== "all") p.set("price", next.price_type);
      if (next.view && next.view !== "grid") p.set("view", next.view);
      const qs = p.toString();
      router.replace(qs ? `/events?${qs}` : "/events", { scroll: false });
    },
    [router],
  );

  function patch<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    updateUrl(next);
  }

  function toggleCategory(slug: string) {
    patch("category", filters.category === slug ? undefined : slug);
  }
  function toggleTag(slug: string) {
    patch("audience_tag", filters.audience_tag === slug ? undefined : slug);
  }
  function toggleSubArea(name: string) {
    patch("sub_area", filters.sub_area === name ? undefined : name);
  }
  function toggleCity(city: string) {
    patch("city", filters.city === city ? undefined : city);
  }
  function toggleFeatured() {
    patch("featured", filters.featured ? undefined : true);
  }
  function toggleDatePreset(preset: typeof DATE_PRESETS[number]["value"]) {
    if (filters.date_preset === preset) {
      const cleared: EventFilters = {
        ...filters,
        date_preset: undefined,
        date_from: undefined,
        date_to: undefined,
      };
      setFilters(cleared);
      updateUrl(cleared);
    } else {
      const range = datePresetRange(preset);
      const next: EventFilters = {
        ...filters,
        date_preset: preset,
        date_from: range.from,
        date_to: range.to,
      };
      setFilters(next);
      updateUrl(next);
    }
  }
  function setPrice(price: "all" | "free" | "paid") {
    patch("price_type", price);
  }
  function setView(view: "grid" | "list") {
    patch("view", view);
  }
  function clearAll() {
    setFilters({});
    setSearchInput("");
    router.replace("/events", { scroll: false });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch("search", searchInput || undefined);
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== undefined && v !== false && v !== "" && v !== "all" && k !== "view",
  ).length;

  // Sidebar-only FilterPanel props — passed by reference
  const panelHandlers = {
    onCity: toggleCity,
    onSubArea: toggleSubArea,
    onCategory: toggleCategory,
    onTag: toggleTag,
    onPreset: toggleDatePreset,
    onPrice: setPrice,
    onFeatured: toggleFeatured,
    onClearAll: clearAll,
  };

  return (
    <>
      {/* ── Mobile filter row ───────────────────────────────────────── */}
      <div className="border-b border-rule bg-cream-50 lg:hidden">
        <div className="editorial-container py-3">
          {/* Row 1 — search */}
          <form onSubmit={onSearchSubmit}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                type="search"
                placeholder="Search events, venues, areas…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-11 w-full pl-10 bg-paper"
                aria-label="Search events"
              />
            </div>
          </form>

          {/* Row 2 — Filters / view / result count */}
          <div className="mt-2.5 flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="md" className="relative flex-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[0.65rem] font-mono text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="overflow-y-auto px-0 pb-8">
                <div className="px-6 pb-6">
                  <SheetHeader>
                    <SheetTitle>Refine your ghurighuri</SheetTitle>
                    <SheetDescription>
                      Narrow down by when, where, and what kind of thing you&rsquo;re up for.
                    </SheetDescription>
                  </SheetHeader>
                </div>
                <div className="px-6 pb-8">
                  <FilterPanel
                    variant="drawer"
                    filters={filters}
                    searchInput={searchInput}
                    onSearchInput={setSearchInput}
                    onSearchSubmit={onSearchSubmit}
                    activeCount={activeFilterCount}
                    {...panelHandlers}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile view toggle */}
            <div
              role="group"
              aria-label="View as"
              className="inline-flex h-11 items-center rounded-md border border-rule bg-paper p-1"
            >
              {VIEW_OPTIONS.map((v) => {
                const active = (filters.view ?? "grid") === v.value;
                const Icon = v.value === "grid" ? LayoutGrid : List;
                return (
                  <button
                    key={v.value}
                    type="button"
                    aria-label={`${v.label} view`}
                    aria-pressed={active}
                    onClick={() => setView(v.value as "grid" | "list")}
                    className={cn(
                      "inline-flex h-9 w-10 items-center justify-center rounded-sm transition-colors",
                      active ? "bg-ink text-paper" : "text-ink-500 hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3 — Quick date chips */}
          <div className="mt-3 -mx-4 overflow-x-auto scrollbar-hide">
            <div className="flex w-max gap-1.5 px-4 py-0.5">
              <span className="eyebrow shrink-0 self-center pr-1">When</span>
              {DATE_PRESETS.map((p) => (
                <SelectChip
                  key={p.value}
                  active={filters.date_preset === p.value}
                  onClick={() => toggleDatePreset(p.value)}
                  className="shrink-0 whitespace-nowrap"
                >
                  {p.label}
                </SelectChip>
              ))}
              <SelectChip
                active={filters.weekend === true}
                onClick={() => patch("weekend", filters.weekend ? undefined : true)}
                className="shrink-0 whitespace-nowrap"
              >
                Weekend
              </SelectChip>
              <SelectChip
                active={filters.featured === true}
                onClick={() => patch("featured", filters.featured ? undefined : true)}
                className="shrink-0 whitespace-nowrap"
              >
                Featured
              </SelectChip>
              <SelectChip
                active={filters.price_type === "free"}
                onClick={() => setPrice(filters.price_type === "free" ? "all" : "free")}
                className="shrink-0 whitespace-nowrap"
              >
                Free
              </SelectChip>
              <span aria-hidden className="w-2 shrink-0" />
            </div>
          </div>

          {/* Row 4 — active pills + result count + reset */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-500">
              <span className="font-semibold text-ink">{resultCount}</span>
              <span className="mx-0.5">·</span>
              {totalCount} curated
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-orange-700 underline-offset-4 hover:underline"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Reset
              </button>
            )}
          </div>

          {/* Row 5 — applied pills (visible if any are set) */}
          {activeFilterCount > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-rule pt-2.5">
              {filters.search && (
                <ActivePill
                  label={`"${filters.search}"`}
                  onClear={() => {
                    setSearchInput("");
                    patch("search", undefined);
                  }}
                />
              )}
              {filters.city && (
                <ActivePill
                  label={`City: ${filters.city}`}
                  onClear={() => patch("city", undefined)}
                />
              )}
              {filters.sub_area && (
                <ActivePill
                  label={`Area: ${filters.sub_area}`}
                  onClear={() => patch("sub_area", undefined)}
                />
              )}
              {filters.category && (
                <ActivePill
                  label={`Category: ${categoryName(filters.category)}`}
                  onClear={() => patch("category", undefined)}
                />
              )}
              {filters.audience_tag && (
                <ActivePill
                  label={`Tag: ${tagName(filters.audience_tag)}`}
                  onClear={() => patch("audience_tag", undefined)}
                />
              )}
              {filters.date_preset && (
                <ActivePill
                  label={`When: ${DATE_PRESETS.find((p) => p.value === filters.date_preset)?.label ?? filters.date_preset}`}
                  onClear={() => toggleDatePreset(filters.date_preset!)}
                />
              )}
              {filters.weekend && (
                <ActivePill label="Weekend only" onClear={() => patch("weekend", undefined)} />
              )}
              {filters.featured && (
                <ActivePill label="Featured only" onClear={() => patch("featured", undefined)} />
              )}
              {filters.price_type && filters.price_type !== "all" && (
                <ActivePill
                  label={`Price: ${filters.price_type}`}
                  onClear={() => setPrice("all")}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop layout — sidebar + content side-by-side ─────────── */}
      <div className="hidden lg:block bg-cream-50 border-b border-rule">
        <div className="editorial-container py-6">
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar (sticky) */}
            <aside className="col-span-3">
              <div className="sticky top-32">
                <FilterPanel
                  variant="sidebar"
                  filters={filters}
                  searchInput={searchInput}
                  onSearchInput={setSearchInput}
                  onSearchSubmit={onSearchSubmit}
                  activeCount={activeFilterCount}
                  {...panelHandlers}
                />
              </div>
            </aside>

            {/* Right column — toolbar + active pills + children (results) */}
            <div className="col-span-9">
              <div className="flex flex-col gap-3">
                {/* Toolbar — search + view + count */}
                <div className="flex items-center gap-3">
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

                  <p className="hidden xl:block text-xs text-ink-500 font-mono uppercase tracking-wider whitespace-nowrap">
                    <span className="text-ink-900 font-semibold">{resultCount}</span> / {totalCount}
                  </p>

                  <div
                    role="group"
                    aria-label="View as"
                    className="inline-flex h-11 items-center rounded-md border border-rule bg-paper p-1"
                  >
                    {VIEW_OPTIONS.map((v) => {
                      const active = (filters.view ?? "grid") === v.value;
                      const Icon = v.value === "grid" ? LayoutGrid : List;
                      return (
                        <button
                          key={v.value}
                          type="button"
                          aria-label={`${v.label} view`}
                          aria-pressed={active}
                          onClick={() => setView(v.value as "grid" | "list")}
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors",
                            active ? "bg-ink text-paper" : "text-ink-500 hover:text-ink",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick chips — date presets + flag chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow mr-1 hidden xl:inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden />
                    Quick
                  </span>
                  {DATE_PRESETS.map((p) => (
                    <SelectChip
                      key={p.value}
                      active={filters.date_preset === p.value}
                      onClick={() => toggleDatePreset(p.value)}
                    >
                      {p.label}
                    </SelectChip>
                  ))}
                  <span className="hidden xl:inline-block mx-2 h-5 w-px bg-rule" />
                  <SelectChip
                    active={filters.weekend === true}
                    onClick={() => patch("weekend", filters.weekend ? undefined : true)}
                  >
                    Weekend
                  </SelectChip>
                  <SelectChip
                    active={filters.featured === true}
                    onClick={() => patch("featured", filters.featured ? undefined : true)}
                  >
                    Featured
                  </SelectChip>
                  <SelectChip
                    active={filters.price_type === "free"}
                    onClick={() => setPrice(filters.price_type === "free" ? "all" : "free")}
                  >
                    Free entry
                  </SelectChip>
                </div>

                {/* Active pills */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-3">
                    <span className="eyebrow">Applied</span>
                    {filters.search && (
                      <ActivePill
                        label={`"${filters.search}"`}
                        onClear={() => {
                          setSearchInput("");
                          patch("search", undefined);
                        }}
                      />
                    )}
                    {filters.city && (
                      <ActivePill
                        label={`City: ${filters.city}`}
                        onClear={() => patch("city", undefined)}
                      />
                    )}
                    {filters.sub_area && (
                      <ActivePill
                        label={`Area: ${filters.sub_area}`}
                        onClear={() => patch("sub_area", undefined)}
                      />
                    )}
                    {filters.category && (
                      <ActivePill
                        label={`Category: ${categoryName(filters.category)}`}
                        onClear={() => patch("category", undefined)}
                      />
                    )}
                    {filters.audience_tag && (
                      <ActivePill
                        label={`Tag: ${tagName(filters.audience_tag)}`}
                        onClear={() => patch("audience_tag", undefined)}
                      />
                    )}
                    {filters.date_preset && (
                      <ActivePill
                        label={`When: ${DATE_PRESETS.find((p) => p.value === filters.date_preset)?.label ?? filters.date_preset}`}
                        onClear={() => toggleDatePreset(filters.date_preset!)}
                      />
                    )}
                    {filters.weekend && (
                      <ActivePill
                        label="Weekend only"
                        onClear={() => patch("weekend", undefined)}
                      />
                    )}
                    {filters.featured && (
                      <ActivePill
                        label="Featured only"
                        onClear={() => patch("featured", undefined)}
                      />
                    )}
                    {filters.price_type && filters.price_type !== "all" && (
                      <ActivePill
                        label={`Price: ${filters.price_type}`}
                        onClear={() => setPrice("all")}
                      />
                    )}
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 underline-offset-4 hover:text-ink hover:underline ml-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden />
                      Reset all
                    </button>
                  </div>
                )}
              </div>

              {/* Results — passed as children so they flow inline with the toolbar */}
              {children && <div className="mt-8">{children}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile results — outside sidebar grid, full width */}
      <div className="lg:hidden">
        {children && <div className="editorial-container py-8">{children}</div>}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// FilterPanel — used in both the desktop sidebar and the mobile drawer.
// ──────────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
  variant: "sidebar" | "drawer";
  filters: EventFilters;
  searchInput: string;
  onSearchInput: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCity: (s: string) => void;
  onSubArea: (s: string) => void;
  onCategory: (s: string) => void;
  onTag: (s: string) => void;
  onPreset: (p: typeof DATE_PRESETS[number]["value"]) => void;
  onPrice: (p: "all" | "free" | "paid") => void;
  onFeatured: () => void;
  onClearAll: () => void;
  activeCount: number;
}

function FilterPanel({
  variant,
  filters,
  searchInput,
  onSearchInput,
  onSearchSubmit,
  onCity,
  onSubArea,
  onCategory,
  onTag,
  onPreset,
  onPrice,
  onFeatured,
  onClearAll,
  activeCount,
}: FilterPanelProps) {
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "rounded-lg border border-rule bg-paper",
        isSidebar && "p-5 shadow-paper",
      )}
    >
      {/* Header — title + reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSidebar && <SlidersHorizontal className="h-4 w-4 text-ink-500" aria-hidden />}
          <span className="eyebrow">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[0.65rem] font-mono text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-md border border-rule px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-orange-700 hover:bg-orange-50 cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Reset all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mt-4">
        <label htmlFor="filter-search" className="eyebrow mb-2 block">
          Search
        </label>
        <form onSubmit={onSearchSubmit}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              id="filter-search"
              type="search"
              placeholder="Title, venue, area…"
              value={searchInput}
              onChange={(e) => onSearchInput(e.target.value)}
              className="h-11 pl-9 bg-cream-50 text-base"
              aria-label="Search events"
            />
          </div>
        </form>
      </div>

      {/* When */}
      <FilterSection title="When" icon={<Calendar className="h-3 w-3" aria-hidden />}>
        <div className="grid grid-cols-2 gap-1.5">
          <PresetButton
            label="Anytime"
            active={!filters.date_preset && !filters.weekend}
            onClick={() => {
              if (filters.date_preset) onPreset(filters.date_preset);
              else if (filters.weekend) onPreset("weekend");
            }}
          />
          {DATE_PRESETS.map((p) => (
            <PresetButton
              key={p.value}
              label={p.label}
              active={filters.date_preset === p.value}
              onClick={() => onPreset(p.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-rule">
          {PRICE_OPTIONS.map((o, i) => {
            const active = (filters.price_type ?? "all") === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => onPrice(o.value)}
                className={cn(
                  "h-9 font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  i !== 0 && "border-l border-rule",
                  active
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink-700 hover:bg-ink hover:text-paper",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <div className="flex flex-wrap gap-1.5">
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

      {/* Sub-area */}
      {filters.city === "Dhaka" && (
        <FilterSection title="Sub-area">
          <div className="flex flex-wrap gap-1.5">
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

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-1.5">
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

      {/* Audience tags */}
      <FilterSection title="Audience">
        <div className="flex flex-wrap gap-1.5">
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

      {/* Flags */}
      <FilterSection title="Flags">
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={filters.featured === true}
              onChange={onFeatured}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                filters.featured
                  ? "border-ink bg-ink text-paper"
                  : "border-rule bg-paper",
              )}
            >
              {filters.featured && (
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="text-sm text-ink-700">Featured only</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Small subcomponents
// ──────────────────────────────────────────────────────────────────────────

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-rule pt-4">
      <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-ink-700">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function ActivePill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="group inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-paper hover:bg-orange-600 transition-colors cursor-pointer"
    >
      <span>{label}</span>
      <X className="h-3 w-3 opacity-80 group-hover:opacity-100" />
    </button>
  );
}

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 rounded-md border px-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-ink bg-ink text-paper"
          : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
function tagName(slug: string) {
  return AUDIENCE_TAGS.find((t) => t.slug === slug)?.name ?? slug;
}