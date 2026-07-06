// Server-side analytics store — append-only NDJSON at data/analytics.ndjson.
//
// Per the project stance ("no backend yet, laziest thing that works"), this is
// the persistence layer for all pageviews, outbound clicks, and form
// completions. Reads are in-memory + 5s TTL — analytics pages load in well
// under 200ms even with thousands of events.
//
// When the FastAPI backend lands, the route handler in app/api/analytics/*
// can be swapped 1:1 with no schema changes — the NDJSON contract stays.

// Note: this module uses Node fs APIs and must only be imported from
// server-only contexts (Next.js App Router route handlers, server components).
// Client code should hit /api/analytics/* instead.

import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  AdminAnalyticsSummary,
  AnalyticsDailyPoint,
  AnalyticsEventRow,
  AnalyticsRange,
  AnalyticsRecentEvent,
  AnalyticsTopCategory,
  AnalyticsTopEvent,
  AnalyticsTopSubArea,
  AnalyticsTrafficSource,
  AnalyticsFunnel,
} from "./analytics-types";
import { FALLBACK_EVENTS } from "./fallback-data";
import { CATEGORIES } from "./categories";

const DATA_DIR = path.join(process.cwd(), "data");
const NDJSON_PATH = path.join(DATA_DIR, "analytics.ndjson");

/** Sub-area display names — same map the fallback synthetic aggregator used */
const SUB_AREA_NAMES: Record<string, string> = {
  dhanmondi: "Dhanmondi",
  gulshan: "Gulshan",
  banani: "Banani",
  mohammadpur: "Mohammadpur",
  old_dhaka: "Old Dhaka",
  mirpur: "Mirpur",
  uttara: "Uttara",
  tejgaon: "Tejgaon",
  rampura: "Rampura",
  badda: "Badda",
};

/** Map category slug → display name */
const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name]),
);

// ─────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────

let cache: { events: AnalyticsEventRow[]; loadedAt: number } | null = null;
const CACHE_TTL_MS = 5_000;

/** Force a re-read on the next call — used after writeAll/truncate. */
function invalidateCache() {
  cache = null;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

/** Read all events. Cached for CACHE_TTL_MS so burst summary calls don't re-parse. */
export async function readAll(): Promise<AnalyticsEventRow[]> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.events;
  }
  await ensureDataDir();
  let raw = "";
  try {
    raw = await fs.readFile(NDJSON_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      cache = { events: [], loadedAt: Date.now() };
      return [];
    }
    throw err;
  }
  const events: AnalyticsEventRow[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const row = JSON.parse(trimmed) as AnalyticsEventRow;
      // Validate the minimum shape — skip malformed lines silently.
      if (row && typeof row.ts === "string" && typeof row.type === "string") {
        events.push(row);
      }
    } catch {
      // Skip malformed lines rather than failing the entire read.
    }
  }
  cache = { events, loadedAt: Date.now() };
  return events;
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

/**
 * Append one event. Fire-and-forget from the route handler — we don't await
 * this in the request lifecycle (the response can return 204 immediately).
 *
 * `meta` is intentionally small — no PII, no full URLs, no poster URLs.
 */
export async function recordEvent(
  event: Omit<AnalyticsEventRow, "ts"> & { ts?: string },
): Promise<void> {
  const row: AnalyticsEventRow = {
    ts: event.ts ?? new Date().toISOString(),
    type: event.type,
    session_id: event.session_id,
    path: event.path ?? null,
    event_id: event.event_id ?? null,
    ref: event.ref ?? null,
    utm_source: event.utm_source ?? null,
    meta: event.meta ?? {},
  };
  try {
    await ensureDataDir();
    await fs.appendFile(NDJSON_PATH, JSON.stringify(row) + "\n", "utf8");
    invalidateCache();
  } catch (err) {
    // Don't crash the route — analytics is best-effort.
    // eslint-disable-next-line no-console
    console.warn("[analytics] append failed:", err);
  }
}

/** Truncate the NDJSON file — admin reset action. */
export async function resetAll(): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(NDJSON_PATH, "", "utf8");
  invalidateCache();
}

// ─────────────────────────────────────────────────────────────
// Aggregation
// ─────────────────────────────────────────────────────────────

/**
 * Build the dashboard summary for the given range.
 * Pure read + bucket — no network calls, <100ms for typical 30d windows.
 */
export async function summary(range: AnalyticsRange): Promise<AdminAnalyticsSummary> {
  const events = await readAll();
  return aggregate(events, range);
}

/**
 * Pure aggregator — exposed for unit testing.
 * Looks up event titles/slugs/categories from FALLBACK_EVENTS first; if no
 * match (e.g. event_id points to a live backend row not in fallback), uses
 * placeholders so the dashboard still renders rows.
 */
export function aggregate(
  events: AnalyticsEventRow[],
  range: AnalyticsRange,
): AdminAnalyticsSummary {
  const days = range === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  // 1. Filter to range
  const inRange = events.filter((e) => {
    const t = new Date(e.ts);
    return !isNaN(t.getTime()) && t >= cutoff;
  });

  // 2. Pre-build event lookup
  const eventLookup = new Map<string, { title: string; slug: string; categories: string[]; sub_area: string }>();
  for (const e of FALLBACK_EVENTS) {
    eventLookup.set(e.id, {
      title: e.title,
      slug: e.slug,
      categories: e.categories,
      sub_area: e.sub_area,
    });
  }

  // 3. Daily buckets
  const dailyBuckets = new Map<string, { pv: number; clicks: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyBuckets.set(key, { pv: 0, clicks: 0 });
  }
  for (const e of inRange) {
    const key = e.ts.slice(0, 10);
    const bucket = dailyBuckets.get(key);
    if (!bucket) continue;
    if (e.type === "page_view") bucket.pv += 1;
    else if (e.type === "outbound_click") bucket.clicks += 1;
  }
  const daily: AnalyticsDailyPoint[] = Array.from(dailyBuckets.entries()).map(
    ([date, { pv, clicks }]) => ({
      date,
      pageviews: pv,
      outbound_clicks: clicks,
    }),
  );

  // 4. Totals + unique sessions
  const total_pageviews = inRange.filter((e) => e.type === "page_view").length;
  const total_outbound_clicks = inRange.filter((e) => e.type === "outbound_click").length;
  const sessionIds = new Set(inRange.map((e) => e.session_id));
  const conversion_rate = total_pageviews > 0 ? total_outbound_clicks / total_pageviews : 0;

  // 5. Form completions + email signups
  const completions = inRange.filter((e) => e.type === "form_completion");
  const form_completions = completions.length;
  const email_signups = completions.filter((e) => e.meta?.form_id === "newsletter").length;

  // 6. Top events by views / clicks
  const eventViews = new Map<string, number>();
  const eventClicks = new Map<string, number>();
  for (const e of inRange) {
    if (!e.event_id) continue;
    if (e.type === "page_view") {
      eventViews.set(e.event_id, (eventViews.get(e.event_id) ?? 0) + 1);
    } else if (e.type === "outbound_click") {
      eventClicks.set(e.event_id, (eventClicks.get(e.event_id) ?? 0) + 1);
    }
  }
  const allEventIds = new Set([...eventViews.keys(), ...eventClicks.keys()]);
  const eventRows = Array.from(allEventIds).map((id) => {
    const meta = eventLookup.get(id);
    return {
      id,
      title: meta?.title ?? id,
      slug: meta?.slug ?? id,
      views: eventViews.get(id) ?? 0,
      clicks: eventClicks.get(id) ?? 0,
    };
  });
  const top_events_by_views: AnalyticsTopEvent[] = eventRows
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const top_events_by_clicks: AnalyticsTopEvent[] = eventRows
    .slice()
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // 7. Top categories — roll up from event pageviews, look up via event metadata
  const categoryCounts = new Map<string, number>();
  for (const e of inRange) {
    if (e.type !== "page_view" || !e.event_id) continue;
    const meta = eventLookup.get(e.event_id);
    if (!meta) continue;
    for (const c of meta.categories) {
      categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
    }
  }
  const totalCat = Array.from(categoryCounts.values()).reduce((s, v) => s + v, 0) || 1;
  const top_categories: AnalyticsTopCategory[] = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, views]) => ({
      slug,
      name: CATEGORY_NAMES[slug] ?? slug.replace(/-/g, " "),
      views,
      share: views / totalCat,
    }));

  // 8. Top sub-areas — same idea via event metadata
  const subCounts = new Map<string, number>();
  for (const e of inRange) {
    if (e.type !== "page_view" || !e.event_id) continue;
    const meta = eventLookup.get(e.event_id);
    if (!meta) continue;
    subCounts.set(meta.sub_area, (subCounts.get(meta.sub_area) ?? 0) + 1);
  }
  const totalSub = Array.from(subCounts.values()).reduce((s, v) => s + v, 0) || 1;
  const top_sub_areas: AnalyticsTopSubArea[] = Array.from(subCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, views]) => ({
      name: SUB_AREA_NAMES[slug] ?? slug.replace(/_/g, " "),
      views,
      share: views / totalSub,
    }));

  // 9. Traffic sources — utm_source first, then ref host, else "(direct)"
  const sourceCounts = new Map<string, { pv: number; clicks: number }>();
  for (const e of inRange) {
    let source: string | null = null;
    if (e.utm_source) {
      source = e.utm_source.toLowerCase();
    } else if (e.ref) {
      // Extract host from ref like "https://instagram.com/..."
      try {
        source = new URL(e.ref).hostname.replace(/^www\./, "");
      } catch {
        source = "(other)";
      }
    } else {
      source = "(direct)";
    }
    const bucket = sourceCounts.get(source) ?? { pv: 0, clicks: 0 };
    if (e.type === "page_view") bucket.pv += 1;
    else if (e.type === "outbound_click") bucket.clicks += 1;
    sourceCounts.set(source, bucket);
  }
  const traffic_sources: AnalyticsTrafficSource[] = Array.from(sourceCounts.entries())
    .map(([source, { pv, clicks }]) => ({ source, pageviews: pv, outbound_clicks: clicks }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 5);

  // 10. Funnel — visitors = unique sessions, event_views = pageviews with event_id
  const funnel: AnalyticsFunnel = {
    visitors: sessionIds.size,
    event_views: inRange.filter((e) => e.type === "page_view" && e.event_id).length,
    outbound_clicks: total_outbound_clicks,
    form_completions,
  };

  // 11. Recent activity — last 20 events (no range filter)
  const recent: AnalyticsRecentEvent[] = events
    .slice()
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, 20)
    .map((e) => ({
      ts: e.ts,
      type: e.type,
      path: e.path ?? null,
      event_id: e.event_id ?? null,
      ref: e.ref ?? null,
    }));

  return {
    range,
    total_pageviews,
    total_outbound_clicks,
    unique_sessions: sessionIds.size,
    conversion_rate,
    form_completions,
    email_signups,
    daily,
    top_events_by_views,
    top_events_by_clicks,
    top_categories,
    top_sub_areas,
    traffic_sources,
    funnel,
    recent,
  };
}