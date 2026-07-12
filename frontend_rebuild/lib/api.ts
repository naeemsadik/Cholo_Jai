// API client with graceful fallback to static dataset.
// Per PRD §8.6: catch fetch failures (network error, timeout, non-2xx) and return
// fallback data instead of throwing, so listing/detail/homepage pages still render.
// IMPORTANT: fallback-rendered content must NOT trigger analytics events.
//
// Wired to the Laravel backend (see backend-laravel/README.md). When
// NEXT_PUBLIC_API_BASE_URL is set (e.g. http://localhost:8000), all endpoints
// hit the Laravel app. When unset, the public reads + analytics + CMS + settings
// fall back to the bundled sample data or the local Next.js route handlers.

import type {
  Event,
  EventFilters,
  EventStatus,
  Lookups,
  Submission,
  ReviewStatus,
  EmailSubscriber,
  AnalyticsEvent,
  AdminAnalyticsSummary,
  AdminSettings,
} from "./types";
import { FALLBACK_EVENTS, FALLBACK_LOOKUPS, FALLBACK_SUBMISSIONS } from "./fallback-data";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 4000;

/**
 * Resolve a relative path to a full URL.
 *
 * API_BASE_URL sends every backend route to Laravel. Without it, requests
 * remain relative to the current Next.js origin.
 */
function resolveUrl(url: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
}

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
      next: { revalidate: 60 },
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function tryFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL && typeof window === "undefined") return null;
  try {
    const res = await fetchWithTimeout(resolveUrl(url), init);
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
// Normalizers — adapt Laravel's wire shape to the frontend's
// domain types so the existing components keep working.
// ──────────────────────────────────────────────────────────

/**
 * Laravel returns:
 *   { city: { id, name, slug }, sub_area: { id, name, slug },
 *     organizer: { name, phone|null, email, website } }
 * The frontend domain types want:
 *   { city: string, sub_area: string, organizer: { name, phone?, email?, social_link? } }
 *
 * Flatten the nested objects to the legacy string shape and rename
 * `organizer.website` → `organizer.social_link`.
 */
function normalizeEvent(raw: unknown): Event {
  const r = (raw ?? {}) as Record<string, unknown>;
  const city = r.city as { name?: string } | string | null | undefined;
  const subArea = r.sub_area as { name?: string } | string | null | undefined;
  const org = r.organizer as
    | { name?: string; phone?: string | null; email?: string | null; website?: string | null; social_link?: string | null }
    | undefined;

  const cityName = typeof city === "string" ? city : city?.name ?? "";
  const subAreaName = typeof subArea === "string" ? subArea : subArea?.name ?? "";

  const flatName =
    (r.organizer_name as string | undefined) ??
    (org?.name as string | undefined) ??
    "";
  const flatPhone =
    (r.organizer_phone as string | undefined) ??
    (org?.phone as string | undefined) ??
    null;
  const flatEmail =
    (r.organizer_email as string | undefined) ??
    (org?.email as string | undefined) ??
    null;
  const flatSocial =
    (r.organizer_social_link as string | undefined) ??
    (org?.website as string | undefined) ??
    (org?.social_link as string | undefined) ??
    null;

  return {
    ...(r as unknown as Event),
    city: cityName,
    sub_area: subAreaName,
    organizer: {
      name: flatName,
      phone: flatPhone,
      email: flatEmail,
      social_link: flatSocial,
    },
  };
}

function normalizeSubmission(raw: unknown): Submission {
  const r = (raw ?? {}) as Record<string, unknown>;
  const city = r.city as { name?: string } | string | null | undefined;
  const subArea = r.sub_area as { name?: string } | string | null | undefined;
  const org = r.organizer as
    | { name?: string; phone?: string | null; email?: string | null; website?: string | null; social_link?: string | null }
    | undefined;

  const cityName = typeof city === "string" ? city : city?.name ?? "";
  const subAreaName = typeof subArea === "string" ? subArea : subArea?.name ?? "";

  return {
    ...(r as unknown as Submission),
    id: String(r.id ?? ""),
    city: cityName,
    sub_area: subAreaName,
    organizer: {
      name:
        (r.organizer_name as string | undefined) ??
        (org?.name as string | undefined) ??
        "",
      phone:
        (r.organizer_phone as string | undefined) ??
        (org?.phone as string | undefined) ??
        "",
      email:
        (r.organizer_email as string | undefined) ??
        (org?.email as string | undefined) ??
        null,
      social_link:
        (r.organizer_social_link as string | undefined) ??
        (org?.website as string | undefined) ??
        (org?.social_link as string | undefined) ??
        null,
    },
  };
}

/**
 * Frontend `Event` (nested organizer) → Laravel wire format (flat fields).
 * Used for admin POST/PATCH requests.
 */
function flattenEventPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out = { ...payload };

  // Handle nested `organizer: { name, phone, email, social_link }`.
  const org = out.organizer as
    | { name?: string; phone?: string | null; email?: string | null; social_link?: string | null }
    | undefined;
  if (org && typeof org === "object") {
    if (org.name !== undefined) out.organizer_name = org.name;
    if (org.phone !== undefined) out.organizer_phone = org.phone;
    if (org.email !== undefined) out.organizer_email = org.email;
    if (org.social_link !== undefined) out.organizer_website = org.social_link;
    delete out.organizer;
  }

  // The frontend allows slug in the payload but Laravel generates it.
  delete out.slug;
  // `expected_attendance` is currently a frontend-only field — backend
  // accepts it but the live Laravel schema doesn't have it. Drop it here.
  delete out.expected_attendance;

  return out;
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

function applyLocalFilters(events: Event[], filters: EventFilters): Event[] {
  const today = new Date().toISOString().slice(0, 10);
  return events.filter((e) => {
    if (e.status !== "published") return false;
    if (!filters.featured && e.start_date < today) return false;
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
  const live = await tryFetch<unknown[]>(`/events${buildQueryString(filters)}`);
  if (live) {
    const normalized = (live as unknown[]).map((e) => normalizeEvent(e as never)) as Event[];
    return { data: normalized, source: "live" };
  }
  const filtered = applyLocalFilters(FALLBACK_EVENTS, filters);
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

export async function getHeroEvents(): Promise<ApiResponse<Event[]>> {
  const live = await tryFetch<unknown[]>(`/events/hero`);
  if (live) {
    return { data: (live as unknown[]).map((e) => normalizeEvent(e as never)) as Event[], source: "live" };
  }
  const today = new Date().toISOString().slice(0, 10);
  const hero = FALLBACK_EVENTS.filter(
    (e) => e.status === "published" && e.show_in_hero && e.start_date >= today,
  );
  const source =
    hero.length > 0
      ? hero.sort((a, b) => a.start_date.localeCompare(b.start_date))
      : FALLBACK_EVENTS.filter(
          (e) => e.status === "published" && e.is_featured && e.start_date >= today,
        ).sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(0, 4);
  return { data: source, source: "fallback" };
}

export async function getEventBySlug(slug: string): Promise<ApiResponse<Event | null>> {
  const live = await tryFetch<unknown>(`/events/${encodeURIComponent(slug)}`);
  if (live) return { data: normalizeEvent(live as never), source: "live" };
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

/**
 * Laravel returns sub_areas as `{ id, city_id, name, slug }` — frontend
 * types use `{ id, city, name, slug }` (city is the city name). Rewrite.
 */
function normalizeLookups(raw: Lookups): Lookups {
  return {
    ...raw,
    sub_areas: (raw.sub_areas ?? []).map((s) => {
      const anyS = s as unknown as Record<string, unknown>;
      return {
        id: s.id,
        // The frontend's SubArea.city is the city NAME. We don't get that
        // from Laravel (we get city_id) so fall back to "Dhaka" (MVP-only city).
        city: "Dhaka",
        name: s.name,
        slug: anyS.slug as string ?? s.name.toLowerCase().replace(/\s+/g, "-"),
      };
    }),
  };
}

export async function getLookups(): Promise<ApiResponse<Lookups>> {
  const live = await tryFetch<Lookups>(`/lookups`);
  if (live) return { data: normalizeLookups(live), source: "live" };
  return { data: FALLBACK_LOOKUPS, source: "fallback" };
}

// ──────────────────────────────────────────────────────────
// Submissions
// ──────────────────────────────────────────────────────────

export interface SubmitPayload {
  title: string;
  title_bn?: string;
  description: string;
  description_bn?: string;
  poster_url: string;
  start_date: string;
  start_time: string;
  end_date?: string;
  end_time?: string;
  city: string;
  sub_area: string;
  venue_name: string;
  venue_name_bn?: string;
  area_details: string;
  area_details_bn?: string;
  maps_link?: string;
  categories: string[];
  audience_tags?: string[];
  price_type: "free" | "paid";
  price_note?: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email?: string;
  organizer_website?: string;
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
  const mock: Submission = {
    id: `local-${Date.now()}`,
    ...payload,
    poster_url: null,
    organizer: {
      name: payload.organizer_name,
      phone: payload.organizer_phone,
      email: payload.organizer_email,
      social_link: payload.organizer_website,
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

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "cj_session_id";
  try {
    const existing = window.sessionStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    window.sessionStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function routeFor(event_type: AnalyticsEventType): string {
  switch (event_type) {
    case "page_view":
      return "/api/analytics/pageview";
    case "outbound_click":
      return "/api/analytics/outbound-click";
    case "form_submit":
    case "subscribe":
      return "/api/analytics/event";
  }
}

function payloadFor(event_type: AnalyticsEventType, p: Partial<AnalyticsEvent>): Record<string, unknown> {
  if (event_type === "page_view") {
    return {
      path: (p.path as string | undefined) ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
      ref: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source:
        new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("utm_source") || null,
    };
  }
  if (event_type === "outbound_click") {
    return {
      event_id: p.event_id ?? "",
      label: (p as Record<string, unknown>).outbound_label as string ?? "",
      href: (p as Record<string, unknown>).outbound_href as string ?? "",
    };
  }
  return {
    form_id:
      event_type === "subscribe"
        ? "newsletter"
        : ((p as Record<string, unknown>).form_id as string ?? "submission"),
    meta: (p as Record<string, unknown>).meta ?? {},
  };
}

export async function trackEvent(
  event_type: AnalyticsEventType,
  payload: Partial<AnalyticsEvent> = {},
): Promise<void> {
  const useLocal = !API_BASE_URL;
  const url = useLocal
    ? routeFor(event_type)
    : `${API_BASE_URL}/analytics/${event_type === "page_view" ? "pageview" : event_type === "outbound_click" ? "outbound-click" : "event"}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const sid = getOrCreateSessionId();
  if (sid) headers["X-Ghurighuri-Session"] = sid;

  try {
    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payloadFor(event_type, payload)),
      keepalive: true,
    });
  } catch {
    // Silent — analytics is best-effort
  }
}

export function trackOutboundClick(eventId: string, label: string, href: string) {
  void trackEvent("outbound_click", {
    event_id: eventId,
    outbound_label: label,
    outbound_href: href,
  } as Partial<AnalyticsEvent>);
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "outbound_click", {
      event_id: eventId,
      outbound_label: label,
      outbound_href: href,
    });
  }
}

export function trackFormCompletion(form_id: string, meta?: Record<string, unknown>) {
  void trackEvent("form_submit", {
    form_id,
    meta: meta ?? {},
  } as unknown as Partial<AnalyticsEvent>);
}

export function trackSubscribe() {
  void trackEvent("subscribe", {} as Partial<AnalyticsEvent>);
}

// ──────────────────────────────────────────────────────────
// Admin auth + auth header helper
// ──────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("cj_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryFetchWithAuth<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL && typeof window === "undefined") return null;
  try {
    const res = await fetchWithTimeout(resolveUrl(url), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
        ...authHeaders(),
      },
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[api] non-2xx from ${url}: ${res.status}`);
      return null;
    }
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[api] admin fetch failed for ${url}:`, err);
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// Admin (live backend) + local fallback store
// ──────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
  const live = await tryFetch<{ token: string }>(`/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (live) return { data: live, source: "live" };
  return { data: null as never, source: "empty", error: "Invalid credentials." };
}

export async function adminLogout(): Promise<void> {
  await tryFetchWithAuth(`/admin/logout`, { method: "POST" });
}

export async function getAdminSubmissions(): Promise<ApiResponse<Submission[]>> {
  const live = await tryFetchWithAuth<unknown[]>(`/admin/submissions`);
  if (live) {
    return {
      data: (live as unknown[]).map((s) => normalizeSubmission(s)),
      source: "live",
    };
  }
  return { data: FALLBACK_SUBMISSIONS, source: "fallback" };
}

export async function adminGetSubmissionById(
  id: string,
): Promise<ApiResponse<Submission | null>> {
  const all = await getAdminSubmissions();
  const submission = all.data.find((s) => s.id === String(id)) ?? null;
  return {
    data: submission,
    source: submission ? all.source : "empty",
    error: submission ? undefined : "Submission not found.",
  };
}

export async function getAdminEvents(): Promise<ApiResponse<Event[]>> {
  const live = await tryFetchWithAuth<unknown[]>(`/admin/events`);
  if (live) {
    const normalized = (live as unknown[]).map((e) => normalizeEvent(e as never)) as Event[];
    return { data: normalized, source: "live" };
  }
  return { data: FALLBACK_EVENTS, source: "fallback" };
}

// Local fallback store (only when live backend is unreachable)
const LOCAL_EVENTS: Map<string, Event> = new Map(
  FALLBACK_EVENTS.map((e) => [e.id, { ...e }]),
);
const LOCAL_SUBMISSIONS: Map<string, Submission> = new Map(
  FALLBACK_SUBMISSIONS.map((s) => [s.id, { ...s }]),
);

function nowIso(): string {
  return new Date().toISOString();
}

// Admin events ─────────────────────────────────────────────────────────────

export async function adminCreateEvent(
  payload: Omit<Event, "id" | "created_at" | "updated_at" | "status"> & {
    status?: EventStatus;
  },
): Promise<ApiResponse<Event>> {
  const wirePayload = flattenEventPayload({ ...(payload as Record<string, unknown>) });
  const live = await tryFetchWithAuth<unknown>(`/admin/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wirePayload),
  });
  if (live) {
    const e = normalizeEvent(live as never);
    LOCAL_EVENTS.set(e.id, e);
    return { data: e, source: "live" };
  }
  const now = nowIso();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const slugBase = payload.slug || payload.title || "untitled";
  const slug =
    slugBase
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || `event-${Date.now()}`;
  const created: Event = {
    ...(payload as Event),
    id,
    slug,
    created_at: now,
    updated_at: now,
    status: payload.status ?? "draft",
  };
  LOCAL_EVENTS.set(id, created);
  return { data: created, source: "fallback" };
}

export async function adminGetEventById(
  id: string,
): Promise<ApiResponse<Event | null>> {
  const live = await tryFetchWithAuth<unknown>(`/admin/events/${encodeURIComponent(id)}`);
  if (live) return { data: normalizeEvent(live as never), source: "live" };
  const local = LOCAL_EVENTS.get(id) ?? null;
  return { data: local, source: local ? "fallback" : "empty" };
}

export async function adminUpdateEvent(
  id: string,
  patch: Partial<Event>,
): Promise<ApiResponse<Event | null>> {
  const wirePayload = flattenEventPayload({ ...(patch as Record<string, unknown>) });
  const live = await tryFetchWithAuth<unknown>(
    `/admin/events/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wirePayload),
    },
  );
  if (live) {
    const e = normalizeEvent(live as never);
    LOCAL_EVENTS.set(e.id, e);
    return { data: e, source: "live" };
  }
  const current = LOCAL_EVENTS.get(id);
  if (!current) return { data: null, source: "empty", error: "Event not found." };
  const next: Event = { ...current, ...patch, updated_at: nowIso() };
  LOCAL_EVENTS.set(id, next);
  return { data: next, source: "fallback" };
}

export async function adminDeleteEvent(id: string): Promise<ApiResponse<{ ok: true }>> {
  const live = await tryFetchWithAuth<{ ok: true }>(
    `/admin/events/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (live) {
    LOCAL_EVENTS.delete(id);
    return { data: { ok: true }, source: "live" };
  }
  LOCAL_EVENTS.delete(id);
  return { data: { ok: true }, source: "fallback" };
}

export async function adminSetEventStatus(
  id: string,
  status: EventStatus,
): Promise<ApiResponse<Event | null>> {
  const live = await tryFetchWithAuth<unknown>(
    `/admin/events/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (live) {
    const e = normalizeEvent(live as never);
    LOCAL_EVENTS.set(e.id, e);
    return { data: e, source: "live" };
  }
  const current = LOCAL_EVENTS.get(id);
  if (!current) return { data: null, source: "empty", error: "Event not found." };
  const next: Event = { ...current, status, updated_at: nowIso() };
  LOCAL_EVENTS.set(id, next);
  return { data: next, source: "fallback" };
}

// Admin submissions ────────────────────────────────────────────────────────

export async function adminUpdateSubmission(
  id: string,
  patch: Partial<Submission>,
): Promise<ApiResponse<Submission | null>> {
  const live = await tryFetchWithAuth<Submission | { submission: Submission }>(
    `/admin/submissions/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  if (live) {
    const submission = "submission" in live ? live.submission : live;
    const normalized = normalizeSubmission(submission);
    LOCAL_SUBMISSIONS.set(normalized.id, normalized);
    return { data: normalized, source: "live" };
  }
  const current = LOCAL_SUBMISSIONS.get(id);
  if (!current) return { data: null, source: "empty", error: "Submission not found." };
  const next: Submission = { ...current, ...patch, updated_at: nowIso() };
  LOCAL_SUBMISSIONS.set(id, next);
  return { data: next, source: "fallback" };
}

export async function adminSetSubmissionReview(
  id: string,
  review_status: ReviewStatus,
  note?: string,
  publish?: boolean,
): Promise<ApiResponse<Submission | null>> {
  const body: Record<string, unknown> = { review_status };
  if (note !== undefined) body.note = note;
  if (publish !== undefined) body.publish = publish;

  const live = await tryFetchWithAuth<
    Submission | { submission: Submission; promoted_event_id?: string | null }
  >(
    `/admin/submissions/${encodeURIComponent(id)}/review`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (live) {
    const submission = "submission" in live ? live.submission : live;
    const normalized = normalizeSubmission(submission);
    LOCAL_SUBMISSIONS.set(normalized.id, normalized);
    return { data: normalized, source: "live" };
  }
  const current = LOCAL_SUBMISSIONS.get(id);
  if (!current) return { data: null, source: "empty", error: "Submission not found." };
  const next: Submission = {
    ...current,
    review_status,
    additional_notes: note ?? current.additional_notes,
    updated_at: nowIso(),
  };
  LOCAL_SUBMISSIONS.set(id, next);
  return { data: next, source: "fallback" };
}

// Admin analytics ──────────────────────────────────────────────────────────

export async function adminGetAnalyticsSummary(
  range: "7d" | "30d" = "30d",
): Promise<ApiResponse<AdminAnalyticsSummary>> {
  // Try live backend first (Laravel /admin/analytics/summary?range=...).
  const live = await tryFetchWithAuth<AdminAnalyticsSummary>(
    `/admin/analytics/summary?range=${range}`,
  );
  if (live) return { data: live, source: "live" };

  // No live backend — query the local Next.js route handler (data/analytics.ndjson).
  if (typeof window === "undefined") {
    return { data: emptyAnalyticsSummary(range), source: "empty" };
  }
  try {
    const res = await fetch(`/api/analytics/summary?range=${range}`, {
      method: "GET",
      headers: { Accept: "application/json", ...authHeaders() },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        data: emptyAnalyticsSummary(range),
        source: "empty",
        error: res.status === 401 ? "Admin session required." : "Analytics unavailable.",
      };
    }
    const data = (await res.json()) as AdminAnalyticsSummary;
    return { data, source: "live" };
  } catch (err) {
    return {
      data: emptyAnalyticsSummary(range),
      source: "empty",
      error: "Could not load analytics.",
    };
  }
}

function emptyAnalyticsSummary(range: "7d" | "30d"): AdminAnalyticsSummary {
  const days = range === "7d" ? 7 : 30;
  const daily: AdminAnalyticsSummary["daily"] = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d.toISOString().slice(0, 10), pageviews: 0, outbound_clicks: 0 };
  });
  return {
    range,
    total_pageviews: 0,
    total_outbound_clicks: 0,
    unique_sessions: 0,
    unique_events_viewed: 0,
    conversion_rate: 0,
    daily,
    top_events_by_views: [],
    top_events_by_clicks: [],
    top_categories: [],
    top_sub_areas: [],
    traffic_sources: [],
    form_completions: 0,
    email_signups: 0,
  };
}

/**
 * Backend does not currently expose a reset/export endpoint — these are
 * admin-only utilities that operate on the local NDJSON store while no
 * backend is configured. They fall through to the live backend only if
 * the routes exist there.
 */
export async function adminResetAnalytics(): Promise<ApiResponse<{ ok: true }>> {
  if (typeof window === "undefined") {
    return { data: { ok: true }, source: "fallback" };
  }
  try {
    const res = await fetch("/api/analytics/reset", {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
    });
    if (!res.ok) {
      return { data: { ok: true }, source: "fallback", error: `Reset failed (${res.status}).` };
    }
    return { data: { ok: true }, source: "live" };
  } catch {
    return { data: { ok: true }, source: "fallback", error: "Reset failed." };
  }
}

export async function adminExportAnalytics(): Promise<ApiResponse<string>> {
  if (typeof window === "undefined") {
    return { data: "", source: "empty" };
  }
  try {
    const res = await fetch("/api/analytics/export", {
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      return { data: "", source: "empty", error: `Export failed (${res.status}).` };
    }
    const text = await res.text();
    return { data: text, source: "live" };
  } catch {
    return { data: "", source: "empty", error: "Export failed." };
  }
}

// Admin settings ───────────────────────────────────────────────────────────

export async function adminGetSettings(): Promise<ApiResponse<AdminSettings>> {
  const live = await tryFetchWithAuth<AdminSettings>(`/api/settings`);
  if (live) return { data: live, source: "live" };
  return {
    data: null as unknown as AdminSettings,
    source: "empty",
    error: "Could not load settings (is the dev server running?).",
  };
}

export async function adminUpdateSettings(
  next: AdminSettings,
): Promise<ApiResponse<AdminSettings>> {
  const live = await tryFetchWithAuth<AdminSettings>(`/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  if (live) return { data: live, source: "live" };
  return {
    data: null as unknown as AdminSettings,
    source: "empty",
    error: "Could not save settings.",
  };
}

// ───────────────────────────────────────────────────────────
// Admin — home page section controls + CMS pages
//
// CMS pages: frontend addresses pages by string id (e.g. "about"). The Laravel
// backend stores them by numeric id and the route is `/api/cms/pages/{id}`.
// We resolve the slug → numeric id via the list endpoint on first read.
// ───────────────────────────────────────────────────────────

export interface HomePageConfigResponse {
  order: string[];
  sections: Record<string, unknown>;
  updated_at: string;
}

export async function adminGetHomeConfig(): Promise<ApiResponse<HomePageConfigResponse>> {
  // Laravel returns the home config under /api/cms/home.
  const live = await tryFetchWithAuth<HomePageConfigResponse>(`/api/cms/home`);
  if (live) return { data: live, source: "live" };

  // Fallback: local Next.js handler.
  if (typeof window === "undefined") {
    return { data: null as unknown as HomePageConfigResponse, source: "empty" };
  }
  try {
    const res = await fetch("/api/cms/home", {
      headers: { Accept: "application/json", ...authHeaders() },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        data: null as unknown as HomePageConfigResponse,
        source: "empty",
        error: res.status === 401 ? "Admin session required." : "Could not load home config.",
      };
    }
    return { data: (await res.json()) as HomePageConfigResponse, source: "live" };
  } catch {
    return { data: null as unknown as HomePageConfigResponse, source: "empty", error: "Network error." };
  }
}

export async function adminUpdateHomeConfig(
  next: HomePageConfigResponse,
): Promise<ApiResponse<HomePageConfigResponse>> {
  const live = await tryFetchWithAuth<HomePageConfigResponse>(`/api/cms/home`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  if (live) return { data: live, source: "live" };

  if (typeof window === "undefined") {
    return { data: next, source: "fallback" };
  }
  try {
    const res = await fetch("/api/cms/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      return { data: next, source: "fallback", error: `Save failed (${res.status}).` };
    }
    return { data: (await res.json()) as HomePageConfigResponse, source: "live" };
  } catch {
    return { data: next, source: "fallback", error: "Network error." };
  }
}

export interface CmsPageListItem {
  id: string;
  slug?: string;
  title?: string;
  updated_at: string;
  block_count: number;
  published?: boolean;
}

export async function adminListCmsPages(): Promise<ApiResponse<CmsPageListItem[]>> {
  const live = await tryFetchWithAuth<{ pages?: CmsPageListItem[] } | CmsPageListItem[]>(
    `/api/cms/pages`,
  );
  if (live) {
    const list = Array.isArray(live) ? live : (live.pages ?? []);
    return { data: list, source: "live" };
  }

  if (typeof window === "undefined") {
    return { data: [], source: "empty" };
  }
  try {
    const res = await fetch("/api/cms/pages", {
      headers: { Accept: "application/json", ...authHeaders() },
      cache: "no-store",
    });
    if (!res.ok) {
      return { data: [], source: "empty", error: res.status === 401 ? "Admin session required." : "Could not list CMS pages." };
    }
    const body = (await res.json()) as { pages: CmsPageListItem[] };
    return { data: body.pages, source: "live" };
  } catch {
    return { data: [], source: "empty", error: "Network error." };
  }
}

export interface CmsPageResponse {
  id: string;
  slug?: string;
  title?: string;
  blocks: unknown[];
  updated_at?: string;
}

/**
 * Resolves a CMS page slug like "about" to the backend's numeric id,
 * falling back to the slug itself if no match is found. Cached per session.
 */
let CMS_ID_CACHE: Map<string, number> | null = null;
async function resolveCmsPageId(slug: string): Promise<string | number> {
  // If it's already numeric, return as-is.
  if (/^\d+$/.test(slug)) return parseInt(slug, 10);

  if (!CMS_ID_CACHE) {
    const list = await adminListCmsPages();
    CMS_ID_CACHE = new Map();
    if (list.data) {
      for (const p of list.data) {
        if (p.slug && /^\d+$/.test(p.id)) {
          CMS_ID_CACHE.set(p.slug, parseInt(p.id, 10));
        }
      }
    }
  }
  const id = CMS_ID_CACHE.get(slug);
  return id ?? slug;
}

export async function adminGetCmsPage(
  id: string,
): Promise<ApiResponse<CmsPageResponse>> {
  const numericId = await resolveCmsPageId(id);

  // Laravel path
  const live = await tryFetchWithAuth<CmsPageResponse>(`/api/cms/pages/${encodeURIComponent(String(numericId))}`);
  if (live) return { data: live, source: "live" };

  // Local fallback
  if (typeof window === "undefined") {
    return { data: null as unknown as CmsPageResponse, source: "empty" };
  }
  try {
    const res = await fetch(`/api/cms/pages/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", ...authHeaders() },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        data: null as unknown as CmsPageResponse,
        source: "empty",
        error: res.status === 401 ? "Admin session required." : `Could not load "${id}".`,
      };
    }
    return { data: (await res.json()) as CmsPageResponse, source: "live" };
  } catch {
    return { data: null as unknown as CmsPageResponse, source: "empty", error: "Network error." };
  }
}

export async function adminUpdateCmsPage(
  id: string,
  blocks: unknown[],
  title?: string,
): Promise<ApiResponse<CmsPageResponse>> {
  const numericId = await resolveCmsPageId(id);

  const body: Record<string, unknown> = { blocks };
  if (title !== undefined) body.title = title;

  // Laravel path
  const live = await tryFetchWithAuth<CmsPageResponse>(
    `/api/cms/pages/${encodeURIComponent(String(numericId))}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (live) return { data: live, source: "live" };

  // Local fallback
  if (typeof window === "undefined") {
    return {
      data: { id, updated_at: new Date().toISOString(), blocks },
      source: "fallback",
    };
  }
  try {
    const res = await fetch(`/api/cms/pages/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return {
        data: { id, updated_at: new Date().toISOString(), blocks },
        source: "fallback",
        error: `Save failed (${res.status}).`,
      };
    }
    return { data: (await res.json()) as CmsPageResponse, source: "live" };
  } catch {
    return {
      data: { id, updated_at: new Date().toISOString(), blocks },
      source: "fallback",
      error: "Network error.",
    };
  }
}
