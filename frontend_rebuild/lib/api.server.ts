// Server-side API client.
//
// Next.js server components cannot import lib/api.ts (which uses fetch +
// `typeof window`) without keeping it server-compatible. This module wraps
// the Laravel backend with timeouts and proper ISR-friendly caching.
//
// Reads go through Next.js's per-request fetch cache (revalidate=N) so
// server-rendered pages share the same backend connection as the admin
// routes. Writes (admin mutations, submissions) are not used here — those
// happen client-side via lib/api.ts.

import { unstable_cache } from "next/cache";
import { FALLBACK_EVENTS, FALLBACK_LOOKUPS, FALLBACK_SUBMISSIONS } from "./fallback-data";
import type { Event, Lookups, Submission } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const SERVER_TIMEOUT_MS = 4000;

const isConfigured = () => Boolean(API_BASE_URL);
const canUseDemoContent = () => !isConfigured();
const EMPTY_LOOKUPS: Lookups = {
  categories: [],
  audience_tags: [],
  sub_areas: [],
  cities: [],
};

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!isConfigured()) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[api.server] fetch failed for ${path}:`, err);
    return null;
  }
}

// ── Normalizers (mirrored from lib/api.ts) ──────────────────────────────

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
    (r.organizer_name as string | undefined) ?? (org?.name as string | undefined) ?? "";
  const flatPhone =
    (r.organizer_phone as string | undefined) ?? (org?.phone as string | undefined) ?? null;
  const flatEmail =
    (r.organizer_email as string | undefined) ?? (org?.email as string | undefined) ?? null;
  const flatSocial =
    (r.organizer_social_link as string | undefined) ??
    (org?.website as string | undefined) ??
    (org?.social_link as string | undefined) ??
    null;

  return {
    ...(r as unknown as Event),
    city: cityName,
    sub_area: subAreaName,
    organizer: { name: flatName, phone: flatPhone, email: flatEmail, social_link: flatSocial },
  };
}

function normalizeLookups(raw: Lookups): Lookups {
  return {
    ...raw,
    sub_areas: (raw.sub_areas ?? []).map((s) => {
      const anyS = s as unknown as Record<string, unknown>;
      return {
        id: s.id,
        city: "Dhaka",
        name: s.name,
        slug: (anyS.slug as string) ?? s.name.toLowerCase().replace(/\s+/g, "-"),
      };
    }),
  };
}

// ── Server-side read helpers ────────────────────────────────────────────

export const serverGetEvents = unstable_cache(
  async (filters?: Record<string, string | boolean>): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v === true) params.set(k, "true");
        else if (typeof v === "string" && v.length) params.set(k, v);
      }
    }
    const qs = params.toString();
    const path = `/events${qs ? `?${qs}` : ""}`;
    const live = await serverFetch<unknown[]>(path);
    if (live) return (live as unknown[]).map((e) => normalizeEvent(e));
    if (!canUseDemoContent()) return [];
    // Local fallback: filtered FALLBACK_EVENTS.
    const today = new Date().toISOString().slice(0, 10);
    return FALLBACK_EVENTS.filter((e) => {
      if (e.status !== "published") return false;
      if (!filters?.featured && e.start_date < today) return false;
      if (filters?.city && e.city !== filters.city) return false;
      if (filters?.sub_area && e.sub_area !== filters.sub_area) return false;
      if (filters?.category && !e.categories.includes(String(filters.category))) return false;
      if (filters?.audience_tag && !(e.audience_tags ?? []).includes(String(filters.audience_tag))) return false;
      return true;
    });
  },
  ["serverGetEvents"],
  { revalidate: 60, tags: ["events"] },
);

export const serverGetHeroEvents = unstable_cache(
  async (): Promise<Event[]> => {
    const live = await serverFetch<unknown[]>("/events/hero");
    if (live) return (live as unknown[]).map((e) => normalizeEvent(e));
    if (!canUseDemoContent()) return [];
    const today = new Date().toISOString().slice(0, 10);
    const hero = FALLBACK_EVENTS.filter(
      (e) => e.status === "published" && e.show_in_hero && e.start_date >= today,
    );
    if (hero.length > 0) return hero;
    return FALLBACK_EVENTS
      .filter((e) => e.status === "published" && e.is_featured && e.start_date >= today)
      .slice(0, 4);
  },
  ["serverGetHeroEvents"],
  { revalidate: 60, tags: ["events"] },
);

export const serverGetFeaturedEvents = unstable_cache(
  async (): Promise<Event[]> => {
    const live = await serverFetch<unknown[]>("/events?featured=true");
    if (live) return (live as unknown[]).map((e) => normalizeEvent(e));
    if (!canUseDemoContent()) return [];
    return FALLBACK_EVENTS.filter((e) => e.status === "published" && e.is_featured);
  },
  ["serverGetFeaturedEvents"],
  { revalidate: 60, tags: ["events"] },
);

export async function serverGetEventBySlug(slug: string): Promise<Event | null> {
  const live = await serverFetch<unknown>(`/events/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (live) return normalizeEvent(live);
  if (!canUseDemoContent()) return null;
  return FALLBACK_EVENTS.find((e) => e.slug === slug && e.status === "published") ?? null;
}

export const serverGetLookups = unstable_cache(
  async (): Promise<Lookups> => {
    const live = await serverFetch<Lookups>("/lookups");
    if (live) return normalizeLookups(live);
    return canUseDemoContent() ? FALLBACK_LOOKUPS : EMPTY_LOOKUPS;
  },
  ["serverGetLookups"],
  { revalidate: 300, tags: ["lookups"] },
);

export const serverGetSubmissions = unstable_cache(
  async (): Promise<Submission[]> => {
    // No public read for submissions, but the API client has admin login
    // for that — left here for completeness.
    return FALLBACK_SUBMISSIONS;
  },
  ["serverGetSubmissions"],
  { revalidate: 60 },
);

// CMS Home page config — mirrors the shape used by app/(public)/page.tsx.
// The Laravel backend returns { order, sections, updated_at } where each
// section is a simple { type, title?, config? }. The frontend types are
// richer (per-section discriminated unions), so we fall back to the
// Next.js local cms-store if the backend shape doesn't match.
export interface BackendHomeResponse {
  order: string[];
  sections: Record<string, { type?: string; title?: string; config?: Record<string, unknown> }>;
  updated_at?: string;
}

export async function serverGetHomeConfig(): Promise<BackendHomeResponse | null> {
  const live = await serverFetch<BackendHomeResponse>("/cms/home");
  return live ?? null;
}

// CMS Page by slug — the /about page uses readCmsPage('about') today.
export interface BackendCmsPageResponse {
  id: number | string;
  slug: string;
  title?: string;
  blocks: unknown[];
  updated_at?: string;
}

export async function serverGetCmsPage(slug: string): Promise<BackendCmsPageResponse | null> {
  // Resolve slug → numeric id by listing first.
  const list = await serverFetch<{ pages?: Array<{ id: number | string; slug: string }> } | Array<{ id: number | string; slug: string }>>(
    "/cms/pages",
  );
  const pages = Array.isArray(list) ? list : list?.pages ?? [];
  const found = pages.find((p) => p.slug === slug);
  if (!found) return null;
  const detail = await serverFetch<BackendCmsPageResponse>(`/cms/pages/${found.id}`);
  return detail;
}
