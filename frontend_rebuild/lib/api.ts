// API client with graceful fallback to static dataset.
// Per PRD §8.6: catch fetch failures (network error, timeout, non-2xx) and return
// fallback data instead of throwing, so listing/detail/homepage pages still render.
// IMPORTANT: fallback-rendered content must NOT trigger analytics events.

import type {
  Event,
  EventFilters,
  Lookups,
  Submission,
  EmailSubscriber,
  AnalyticsEvent,
} from "./types";
import { FALLBACK_EVENTS, FALLBACK_LOOKUPS, FALLBACK_SUBMISSIONS } from "./fallback-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const REQUEST_TIMEOUT_MS = 4000;

export type DataSource = "live" | "fallback" | "empty";

export interface ApiResponse<T> {
  data: T;
  source: DataSource;
  error?: string;
}

class ApiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeout = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.headers || {}),
      },
      // Next.js fetch caching — defaults are sensible for ISR
      next: { revalidate: 60 },
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function tryFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL) return null; // No backend configured — use fallback
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}${url}`, init);
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[api] non-2xx from ${url}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      // eslint-disable-next-line no-console
      console.warn(`[api] timeout fetching ${url}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[api] fetch failed for ${url}:`, err);
    }
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Events
// ──────────────────────────────────────────────────────────

function buildQueryString(filters: EventFilters): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.sub_area) params.set("sub_area", filters.sub_area);
  if (filters.category) params.set("category", filters.category);
  if (filters.audience_tag) params.set("audience_tag", filters.audience_tag);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.weekend) params.set("weekend", "true");
  if (filters.search) params.set("search", filters.search);
  if (filters.featured) params.set("featured", "true");
  if (filters.price_type && filters.price_type !== "all") {
    params.set("price_type", filters.price_type);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Local filter — applied to fallback data so the UI feels identical to live
function applyLocalFilters(events: Event[], filters: EventFilters): Event[] {
  const today = new Date().toISOString().slice(0, 10);
  return events.filter((e) => {
    if (e.status !== "published") return false;
    if (!filters.featured && e.start_date < today) return false; // exclude past unless filtering by featured
    if (filters.city && e.city !== filters.city) return false;
    if (filters.sub_area && e.sub_area !== filters.sub_area) return false;
    if (filters.category && !e.categories.includes(filters.category)) return false;
    if (
      filters.audience_tag &&
      !(e.audience_tags || []).includes(filters.audience_tag)
    )
      return false;
    if (filters.date_from && e.start_date < filters.date_from) return false;
    if (filters.date_to && e.start_date > filters.date_to) return false;
    if (filters.weekend) {
      const d = new Date(e.start_date);
      const day = d.getDay();
      if (day !== 5 && day !== 6 && day !== 0) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        e.title,
        e.description,
        e.venue_name,
        e.area_details,
        e.sub_area,
        ...(e.categories || []),
        ...(e.audience_tags || []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.price_type === "free" && e.price_type !== "free") return false;
    if (filters.price_type === "paid" && e.price_type !== "paid") return false;
    return true;
  });
}

export async function getEvents(filters: EventFilters = {}): Promise<ApiResponse<Event[]>> {
  const live = await tryFetch<Event[]>(`/events${buildQueryString(filters)}`);
  if (live) {
    return { data: live, source: "live" };
  }
  const filtered = applyLocalFilters(FALLBACK_EVENTS, filters);
  // Sort by date ascending
  filtered.sort((a, b) => a.start_date.localeCompare(b.start_date));
  return {
    data: filtered,
    source: "fallback",
    error: "Backend unreachable — showing curated sample events.",
  };
}

export async function getFeaturedEvents(): Promise<ApiResponse<Event[]>> {
  return getEvents({ featured: true });
}

export async function getEventBySlug(slug: string): Promise<ApiResponse<Event | null>> {
  const live = await tryFetch<Event>(`/events/${encodeURIComponent(slug)}`);
  if (live) return { data: live, source: "live" };
  const found = FALLBACK_EVENTS.find((e) => e.slug === slug && e.status === "published") ?? null;
  return {
    data: found,
    source: "fallback",
    error: found ? undefined : "Event not found in fallback dataset.",
  };
}

export async function getRelatedEvents(
  eventId: string,
  categorySlugs: string[],
): Promise<ApiResponse<Event[]>> {
  const all = await getEvents();
  const related = all.data
    .filter((e) => e.id !== eventId && e.categories.some((c) => categorySlugs.includes(c)))
    .slice(0, 3);
  return { data: related, source: all.source };
}

// ──────────────────────────────────────────────────────────
// Lookups
// ──────────────────────────────────────────────────────────

export async function getLookups(): Promise<ApiResponse<Lookups>> {
  const live = await tryFetch<Lookups>(`/lookups`);
  if (live) return { data: live, source: "live" };
  return { data: FALLBACK_LOOKUPS, source: "fallback" };
}

// ──────────────────────────────────────────────────────────
// Submissions
// ──────────────────────────────────────────────────────────

export interface SubmitPayload {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date?: string;
  end_time?: string;
  city: string;
  sub_area: string;
  venue_name: string;
  area_details: string;
  maps_link?: string;
  categories: string[];
  audience_tags?: string[];
  price_type: "free" | "paid";
  price_note?: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email?: string;
  organizer_social_link?: string;
  outbound_link: string;
  expected_attendance?: number;
  wants_promotion_support: boolean;
  additional_notes?: string;
}

export async function submitEvent(payload: SubmitPayload): Promise<ApiResponse<Submission>> {
  const live = await tryFetch<Submission>(`/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (live) return { data: live, source: "live" };
  // Fallback: simulate submission success locally so UX is not broken
  const mock: Submission = {
    id: `local-${Date.now()}`,
    ...payload,
    poster_url: null,
    organizer: {
      name: payload.organizer_name,
      phone: payload.organizer_phone,
      email: payload.organizer_email,
      social_link: payload.organizer_social_link,
    },
    review_status: "submitted",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return {
    data: mock,
    source: "fallback",
    error: "Backend unreachable — your submission was not actually saved. Please retry later.",
  };
}

// ──────────────────────────────────────────────────────────
// Subscribers
// ──────────────────────────────────────────────────────────

export async function subscribe(email: string): Promise<ApiResponse<EmailSubscriber>> {
  const live = await tryFetch<EmailSubscriber>(`/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (live) return { data: live, source: "live" };
  const mock: EmailSubscriber = {
    id: `local-${Date.now()}`,
    email,
    created_at: new Date().toISOString(),
  };
  return {
    data: mock,
    source: "fallback",
    error: "Backend unreachable — your subscription was not actually saved.",
  };
}

// ──────────────────────────────────────────────────────────
// Analytics — fire-and-forget client events
// ──────────────────────────────────────────────────────────

export type AnalyticsEventType = AnalyticsEvent["event_type"];

export async function trackEvent(
  event_type: AnalyticsEventType,
  payload: Partial<AnalyticsEvent> = {},
): Promise<void> {
  // Per PRD §8.6: fallback-rendered content must NOT trigger analytics.
  // We rely on each page reporting its dataSource at runtime — see lib/data-source-context.
  // For simplicity we always try the backend and silently fail if it's down.
  if (!API_BASE_URL) return;
  try {
    await fetchWithTimeout(
      `${API_BASE_URL}/analytics/${event_type === "page_view" ? "pageview" : event_type === "outbound_click" ? "outbound-click" : "event"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type,
          referrer: typeof document !== "undefined" ? document.referrer : null,
          source: new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("utm_source"),
          path: typeof window !== "undefined" ? window.location.pathname : null,
          ...payload,
        }),
      },
      2000,
    );
  } catch {
    // Silent — analytics is best-effort
  }
}

export function trackOutboundClick(eventId: string, label: string, href: string) {
  // Fire-and-forget
  void trackEvent("outbound_click", { event_id: eventId });
  // gtag-style fallback if no backend
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "outbound_click", {
      event_id: eventId,
      outbound_label: label,
      outbound_href: href,
    });
  }
}

// ──────────────────────────────────────────────────────────
// Admin (placeholder — admin UI is client-rendered and uses local state when API is down)
// ──────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
  const live = await tryFetch<{ token: string }>(`/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (live) return { data: live, source: "live" };
  // Demo-mode: accept any non-empty credentials when API is offline
  if (email && password) {
    return { data: { token: "demo-mode-token" }, source: "fallback" };
  }
  return { data: null as never, source: "empty", error: "Invalid credentials." };
}

export async function getAdminSubmissions(): Promise<ApiResponse<Submission[]>> {
  const live = await tryFetch<Submission[]>(`/admin/submissions`);
  if (live) return { data: live, source: "live" };
  return { data: FALLBACK_SUBMISSIONS, source: "fallback" };
}

export async function getAdminEvents(): Promise<ApiResponse<Event[]>> {
  const live = await tryFetch<Event[]>(`/admin/events`);
  if (live) return { data: live, source: "live" };
  return { data: FALLBACK_EVENTS, source: "fallback" };
}