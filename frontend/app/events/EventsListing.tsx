"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchEvents } from "@/lib/api";
import type { EventItem } from "@/lib/types";
import { categories, audienceTags, subAreas } from "@/lib/fallback-data";
import { EventCard } from "@/components/EventCard";
import { clsx, formatDate, formatTime } from "@/lib/util";

const PRICE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const DATE_OPTIONS = [
  { value: "any", label: "Anytime" },
  { value: "today", label: "Today" },
  { value: "weekend", label: "This Weekend" },
  { value: "next7", label: "Next 7 Days" },
  { value: "next30", label: "Next 30 Days" },
];

export function EventsListing() {
  const router = useRouter();
  const params = useSearchParams();

  const [subArea, setSubArea] = useState("");
  const [category, setCategory] = useState("");
  const [audienceTag, setAudienceTag] = useState("");
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("any");
  const [dateRange, setDateRange] = useState("any");
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const filter = params.get("filter");
    if (filter === "weekend") setDateRange("weekend");
    if (filter === "free") setPrice("free");
    const c = params.get("category");
    if (c) setCategory(c);
    const s = params.get("sub_area");
    if (s) setSubArea(s);
  }, [params]);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (subArea) qs.set("sub_area", subArea);
    if (audienceTag) qs.set("audience_tag", audienceTag);
    if (search) qs.set("search", search);
    if (price !== "any") qs.set("price", price);
    if (dateRange !== "any") qs.set("date", dateRange);
    const next = qs.toString();
    router.replace(`/events${next ? "?" + next : ""}`, { scroll: false });
  }, [category, subArea, audienceTag, search, price, dateRange, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const today = new Date();
      const isoToday = today.toISOString().slice(0, 10);
      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      let weekend: boolean | undefined;
      if (dateRange === "today") {
        dateFrom = isoToday;
        dateTo = isoToday;
      } else if (dateRange === "weekend") {
        weekend = true;
      } else if (dateRange === "next7") {
        const d = new Date(today);
        d.setDate(d.getDate() + 7);
        dateFrom = isoToday;
        dateTo = d.toISOString().slice(0, 10);
      } else if (dateRange === "next30") {
        const d = new Date(today);
        d.setDate(d.getDate() + 30);
        dateFrom = isoToday;
        dateTo = d.toISOString().slice(0, 10);
      }
      const { items: raw } = await fetchEvents({
        city: "Dhaka",
        sub_area: subArea || undefined,
        category: category || undefined,
        audience_tag: audienceTag || undefined,
        search: search || undefined,
        date_from: dateFrom,
        date_to: dateTo,
        weekend,
      });
      const filtered = price === "any" ? raw : raw.filter((e) => e.price_type === price);
      if (!cancelled) {
        setItems(filtered);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [subArea, category, audienceTag, search, price, dateRange]);

  const reset = () => {
    setSubArea("");
    setCategory("");
    setAudienceTag("");
    setSearch("");
    setPrice("any");
    setDateRange("any");
  };

  const activeCount = useMemo(
    () =>
      [subArea, category, audienceTag, search, price !== "any" ? price : "", dateRange !== "any" ? dateRange : ""]
        .filter(Boolean).length,
    [subArea, category, audienceTag, search, price, dateRange]
  );

  return (
    <div className="bg-paper">
      {/* Header */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-12 md:py-16">
          <div className="eyebrow mb-4">Index · All listings · Dhaka</div>
          <div className="grid grid-cols-12 gap-6 items-end">
            <h1 className="col-span-12 md:col-span-8 t-huge text-ink">
              The full index,
              <br />
              <span className="font-serif italic text-accent">live now.</span>
            </h1>
            <div className="col-span-12 md:col-span-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70 md:text-right">
              {String(items.length).padStart(3, "0")} active listings
              <br />
              {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied` : "No filters applied"}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-ed px-5 md:px-8 py-8 grid grid-cols-12 gap-6">
        {/* Sidebar filters */}
        <aside className="col-span-12 lg:col-span-3 hidden lg:block">
          <FilterPanel
            subArea={subArea}
            setSubArea={setSubArea}
            category={category}
            setCategory={setCategory}
            audienceTag={audienceTag}
            setAudienceTag={setAudienceTag}
            price={price}
            setPrice={setPrice}
            dateRange={dateRange}
            setDateRange={setDateRange}
            search={search}
            setSearch={setSearch}
            reset={reset}
            activeCount={activeCount}
          />
        </aside>

        <main className="col-span-12 lg:col-span-9">
          {/* Mobile filter bar */}
          <div className="lg:hidden mb-4 flex items-center gap-2 border border-ink">
            <button onClick={() => setDrawer(true)} className="btn-ghost flex-1 !border-0 !rounded-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round" />
              </svg>
              Filters {activeCount > 0 && <span className="text-accent">({activeCount})</span>}
            </button>
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="btn-icon !border-0 !border-l !border-ink"
              aria-label={`Switch to ${view === "grid" ? "list" : "grid"} view`}
            >
              {view === "grid" ? "≡" : "▦"}
            </button>
          </div>

          {/* Desktop toolbar */}
          <div className="hidden lg:flex items-center justify-between mb-6 border border-ink px-4 py-3 bg-bone">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70">
              Showing · {String(items.length).padStart(3, "0")} · sorted by date
            </div>
            <div className="flex items-center gap-1 border border-ink">
              <button
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                className={clsx("h-9 px-3 font-mono uppercase tracking-[0.18em] text-[11px] focus-ring", view === "grid" ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink hover:text-paper")}
              >
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={clsx("h-9 px-3 font-mono uppercase tracking-[0.18em] text-[11px] border-l border-ink focus-ring", view === "list" ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink hover:text-paper")}
              >
                List
              </button>
            </div>
          </div>

          {loading ? (
            <Skeleton view={view} />
          ) : items.length === 0 ? (
            <EmptyState reset={reset} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((ev, i) => (
                <EventCard key={ev.id} ev={ev} index={i} />
              ))}
            </div>
          ) : (
            <ListView items={items} />
          )}
        </main>
      </div>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute top-0 right-0 bottom-0 w-[88vw] max-w-sm bg-paper border-l border-ink overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b border-ink">
              <span className="font-display text-xl tracking-tightest">Filters</span>
              <button onClick={() => setDrawer(false)} aria-label="Close filters" className="btn-icon h-10 w-10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <FilterPanel
              subArea={subArea}
              setSubArea={setSubArea}
              category={category}
              setCategory={setCategory}
              audienceTag={audienceTag}
              setAudienceTag={setAudienceTag}
              price={price}
              setPrice={setPrice}
              dateRange={dateRange}
              setDateRange={setDateRange}
              search={search}
              setSearch={setSearch}
              reset={reset}
              activeCount={activeCount}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel(props: {
  subArea: string;
  setSubArea: (s: string) => void;
  category: string;
  setCategory: (s: string) => void;
  audienceTag: string;
  setAudienceTag: (s: string) => void;
  price: string;
  setPrice: (s: string) => void;
  dateRange: string;
  setDateRange: (s: string) => void;
  search: string;
  setSearch: (s: string) => void;
  reset: () => void;
  activeCount: number;
  compact?: boolean;
}) {
  return (
    <div className={clsx("border border-ink bg-bone", props.compact ? "" : "sticky top-28 p-6")}>
      {!props.compact && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink">
          <span className="font-display text-xl tracking-tighter">Filters</span>
          {props.activeCount > 0 && (
            <button onClick={props.reset} className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent hover:underline">
              Reset ({props.activeCount})
            </button>
          )}
        </div>
      )}
      <div className={clsx("space-y-5", props.compact && "p-5")}>
        <div>
          <label htmlFor="filter-search" className="label-brut mb-2 block">Search</label>
          <input
            id="filter-search"
            value={props.search}
            onChange={(e) => props.setSearch(e.target.value)}
            placeholder="Title, sector, category…"
            className="input-brut"
          />
        </div>
        <div>
          <label htmlFor="filter-when" className="label-brut mb-2 block">When</label>
          <select id="filter-when" value={props.dateRange} onChange={(e) => props.setDateRange(e.target.value)} className="input-brut">
            {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <span className="label-brut mb-2 block">Price</span>
          <div className="grid grid-cols-3 border border-ink">
            {PRICE_OPTIONS.map((o, i) => (
              <button
                key={o.value}
                onClick={() => props.setPrice(o.value)}
                aria-pressed={props.price === o.value}
                className={clsx(
                  "py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] focus-ring",
                  i !== 0 && "border-l border-ink",
                  props.price === o.value ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink hover:text-paper"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="filter-sector" className="label-brut mb-2 block">Sector</label>
          <select id="filter-sector" value={props.subArea} onChange={(e) => props.setSubArea(e.target.value)} className="input-brut">
            <option value="">All sectors</option>
            {subAreas.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-cat" className="label-brut mb-2 block">Category</label>
          <select id="filter-cat" value={props.category} onChange={(e) => props.setCategory(e.target.value)} className="input-brut">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filter-tag" className="label-brut mb-2 block">Audience tag</label>
          <select id="filter-tag" value={props.audienceTag} onChange={(e) => props.setAudienceTag(e.target.value)} className="input-brut">
            <option value="">Any audience</option>
            {audienceTags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
        </div>
        {props.compact && (
          <button onClick={props.reset} className="btn-ghost w-full mt-3">
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}

function Skeleton({ view }: { view: "grid" | "list" }) {
  if (view === "list") {
    return (
      <div className="border border-ink p-12 text-center font-mono uppercase tracking-[0.2em] text-[12px] text-ink/60">
        Loading…
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-ink bg-bone aspect-[4/5] animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="border border-ink bg-bone p-10 md:p-16 text-center">
      <div className="eyebrow mb-4 !justify-center">No match found</div>
      <h3 className="t-huge tracking-tighter mb-4">
        Nothing<br />
        <span className="font-serif italic text-accent">here.</span> Yet.
      </h3>
      <p className="text-ink/70 max-w-md mx-auto mb-6 font-serif">
        We couldn&rsquo;t find a listing matching all your filters. Try loosening
        one — or browse the full index.
      </p>
      <button onClick={reset} className="btn-accent">
        ↺ Reset filters
      </button>
    </div>
  );
}

function ListView({ items }: { items: EventItem[] }) {
  return (
    <div className="border border-ink overflow-x-auto bg-paper">
      <table className="btable">
        <thead>
          <tr>
            <th>№</th>
            <th>Date</th>
            <th>Listing</th>
            <th className="hidden md:table-cell">Sector</th>
            <th className="hidden lg:table-cell">Category</th>
            <th className="hidden md:table-cell">Time</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((ev, i) => (
            <tr key={ev.id}>
              <td className="font-display text-lg">{String(i + 1).padStart(2, "0")}</td>
              <td>{formatDate(ev.start_date)}</td>
              <td className="font-display">
                <a href={`/events/${ev.slug}`} className="hover:text-accent transition-colors">
                  {ev.title}
                </a>
              </td>
              <td className="hidden md:table-cell">{ev.sub_area}</td>
              <td className="hidden lg:table-cell uppercase">{ev.categories[0]}</td>
              <td className="hidden md:table-cell font-mono text-xs">{formatTime(ev.start_time)}</td>
              <td>
                <span className={clsx("chip", ev.price_type === "free" ? "chip-accent" : "chip-ink")}>
                  {ev.price_type.toUpperCase()}
                </span>
              </td>
              <td>
                <a href={`/events/${ev.slug}`} className="text-accent">
                  →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}