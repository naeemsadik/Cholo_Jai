// Server + client safe API client. Browser-only side effects are guarded.
import type { EventItem, EventFilters } from "./types";
import { fallbackEvents } from "./fallback-data";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")) || "";

type Flags = { usingFallback?: boolean };

async function safeFetch<T>(path: string, init?: RequestInit): Promise<{ data: T | null; flags: Flags }> {
  if (!API_BASE) return { data: null, flags: { usingFallback: true } };
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctl.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
    clearTimeout(t);
    if (!res.ok) return { data: null, flags: { usingFallback: true } };
    const data = (await res.json()) as T;
    return { data, flags: { usingFallback: false } };
  } catch {
    return { data: null, flags: { usingFallback: true } };
  }
}

function applyFilters(items: EventItem[], f: EventFilters): EventItem[] {
  return items.filter((ev) => {
    if (ev.status !== "published") return false;
    if (f.city && ev.city !== f.city) return false;
    if (f.sub_area && ev.sub_area !== f.sub_area) return false;
    if (f.category && !ev.categories.includes(f.category)) return false;
    if (f.audience_tag && !(ev.audience_tags || []).includes(f.audience_tag)) return false;
    if (f.search) {
      const s = f.search.toLowerCase();
      const hay = `${ev.title} ${ev.description} ${ev.sub_area} ${ev.venue_name} ${ev.categories.join(" ")} ${(ev.audience_tags || []).join(" ")}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    if (f.date_from && ev.start_date < f.date_from) return false;
    if (f.date_to && ev.start_date > f.date_to) return false;
    if (f.weekend) {
      const day = new Date(ev.start_date).getDay();
      const isWknd = day === 5 || day === 6 || day === 0;
      if (!isWknd) return false;
    }
    if (f.featured && !ev.is_featured) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (ev.end_date ? ev.end_date < today : ev.start_date < today) return false;
    return true;
  });
}

export async function fetchEvents(filters: EventFilters = {}) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
  });
  const path = `/events${qs.toString() ? `?${qs}` : ""}`;
  const { data, flags } = await safeFetch<EventItem[]>(path);
  const items = data ?? applyFilters(fallbackEvents, filters);
  items.sort((a, b) => a.start_date.localeCompare(b.start_date));
  return { items, flags };
}

export async function fetchEventBySlug(slug: string) {
  const { data, flags } = await safeFetch<EventItem>(`/events/${slug}`);
  const item = data ?? fallbackEvents.find((e) => e.slug === slug) ?? null;
  return { item, flags };
}

export async function fetchFeatured() {
  const { data, flags } = await safeFetch<EventItem[]>("/events?featured=true");
  const items = data ?? fallbackEvents.filter((e) => e.is_featured && e.status === "published");
  items.sort((a, b) => a.start_date.localeCompare(b.start_date));
  return { items, flags };
}

export async function postSubmission(payload: Record<string, unknown>) {
  const url = `${API_BASE}/submissions`;
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, flags: { usingFallback: true } } as const;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, flags: { usingFallback: !res.ok } } as const;
  } catch {
    return { ok: false, flags: { usingFallback: true } } as const;
  }
}

export async function postSubscriber(email: string) {
  const url = `${API_BASE}/subscribers`;
  if (!API_BASE) {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true, flags: { usingFallback: true } } as const;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return { ok: res.ok, flags: { usingFallback: !res.ok } } as const;
  } catch {
    return { ok: false, flags: { usingFallback: true } } as const;
  }
}

// Analytics — fire-and-forget. Skipped automatically if no backend or non-browser env.
export function trackPageview(path: string, eventId?: string) {
  if (typeof window === "undefined") return;
  if (!API_BASE) return;
  try {
    fetch(`${API_BASE}/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, event_id: eventId, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackOutboundClick(eventId: string, label: string, url: string) {
  if (typeof window === "undefined") return;
  if (!API_BASE) return;
  try {
    fetch(`${API_BASE}/analytics/outbound-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, label, url }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackFormSubmission(formName: string) {
  if (typeof window === "undefined") return;
  if (!API_BASE) return;
  try {
    fetch(`${API_BASE}/analytics/form-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: formName }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}