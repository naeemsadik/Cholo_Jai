// Shared analytics types — used by both the client (POST event payloads) and
// the server (NDJSON store + summary aggregator).
//
// One append-only NDJSON file at data/analytics.ndjson holds events of shape:
//
//   {"ts":"2026-07-06T10:23:18Z","type":"page_view","path":"/events",
//    "session_id":"...","event_id":null,"ref":"instagram","utm_source":"ig","meta":{}}
//
// We deliberately keep the shape flat + denormalised so reads stay cheap
// (in-memory parse + bucket) and so the same payload round-trips through
// fetch without ceremony.

export type AnalyticsEventType =
  | "page_view"
  | "outbound_click"
  | "form_completion";

/**
 * One row in data/analytics.ndjson.
 * `meta` is a free-form bag (form ids, outbound labels, etc.) — keep it small.
 */
export interface AnalyticsEventRow {
  ts: string; // ISO timestamp
  type: AnalyticsEventType;
  session_id: string;
  path?: string | null;
  event_id?: string | null; // FK to event/submission when known
  ref?: string | null; // document.referrer (best-effort parsed host)
  utm_source?: string | null;
  meta?: Record<string, string | number | boolean | null>;
}

/** Payload accepted by POST /api/analytics/pageview */
export interface PageviewPayload {
  path: string;
  ref?: string | null;
  utm_source?: string | null;
}

/** Payload accepted by POST /api/analytics/outbound-click */
export interface OutboundClickPayload {
  event_id: string;
  label: string;
  href: string;
}

/** Payload accepted by POST /api/analytics/event */
export interface EventCompletionPayload {
  form_id: string;
  meta?: Record<string, string | number | boolean | null>;
}

/** Server response shape — all write endpoints return 204, but we type-check. */
export type AnalyticsWriteResponse = { ok: true };

/** Range keys supported by the summary endpoint */
export type AnalyticsRange = "7d" | "30d";

/** Computed daily bucket — what the time-series chart consumes */
export interface AnalyticsDailyPoint {
  date: string; // "YYYY-MM-DD"
  pageviews: number;
  outbound_clicks: number;
}

/** Per-event totals — feeds the top-N tables */
export interface AnalyticsTopEvent {
  id: string;
  title: string;
  slug: string;
  views: number;
  clicks: number;
}

/** Category roll-up — views per category slug */
export interface AnalyticsTopCategory {
  slug: string;
  name: string;
  views: number;
  share: number; // 0..1
}

/** Sub-area roll-up */
export interface AnalyticsTopSubArea {
  name: string;
  views: number;
  share: number;
}

/** Traffic-source breakdown — utm_source when present, else "(direct)" */
export interface AnalyticsTrafficSource {
  source: string;
  pageviews: number;
  outbound_clicks: number;
}

/** Funnel step counts — derived from event types */
export interface AnalyticsFunnel {
  visitors: number; // unique session_ids
  event_views: number; // pageviews with event_id
  outbound_clicks: number;
  form_completions: number;
}

/** Recent-activity row for the bottom of the dashboard */
export interface AnalyticsRecentEvent {
  ts: string;
  type: AnalyticsEventType;
  path?: string | null;
  event_id?: string | null;
  ref?: string | null;
}

/**
 * Final summary shape returned by GET /api/analytics/summary.
 * Mirrors what /admin/analytics renders — see components/admin/analytics-view.tsx.
 */
export interface AdminAnalyticsSummary {
  range: AnalyticsRange;
  total_pageviews: number;
  total_outbound_clicks: number;
  unique_sessions: number;
  conversion_rate: number; // outbound_clicks / pageviews
  form_completions: number;
  email_signups: number;
  daily: AnalyticsDailyPoint[];
  top_events_by_views: AnalyticsTopEvent[];
  top_events_by_clicks: AnalyticsTopEvent[];
  top_categories: AnalyticsTopCategory[];
  top_sub_areas: AnalyticsTopSubArea[];
  traffic_sources: AnalyticsTrafficSource[];
  funnel: AnalyticsFunnel;
  recent: AnalyticsRecentEvent[];
}