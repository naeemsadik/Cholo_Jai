// Client-safe utilities + locale-aware wrappers.
//
// The locale-aware formatters take a `CalendarNames` + small label set
// from the dict, so this file can be imported from client components
// without dragging in `next/headers`. Server components use utils.server.ts
// for the same names bound to the active dictionary automatically.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "./i18n/types";
import { getActiveDictionary as _getDictionaryClient } from "./i18n/client";
import {
  formatEventDate as _formatEventDate,
  formatTime as _formatTime,
  formatPrice as _formatPrice,
  relativeTime as _relativeTime,
  toBengaliNumerals,
  type CalendarNames,
} from "./i18n/format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDate(
  iso: string,
  time?: string,
  locale?: Locale,
): string {
  // If no locale passed, fall back to bn to match the rest of the API.
  const loc: Locale = locale ?? "bn";
  if (typeof window === "undefined" || !locale) {
    // Server context — read dict via the small shim, but in practice the
    // server-side helper is in utils.server.ts. This branch is only hit
    // if a caller forgets to specify locale; we return the Latin form
    // (date-fns / toLocaleDateString) as a safe default.
    try {
      const d = new Date(iso);
      const dateStr = d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
      if (!time) return dateStr;
      return `${dateStr} · ${_formatTime(time, "en")}`;
    } catch {
      return iso;
    }
  }
  // Client — use the React context to find the dict
  const dict = _getDictionaryClient();
  return _formatEventDate(
    iso,
    time,
    loc,
    dict.calendar,
    dict.common.free,
    dict.common.paid,
  );
}

export function formatTime(hhmm: string, locale: Locale = "en"): string {
  return _formatTime(hhmm, locale);
}

export function formatPrice(
  price_type: "free" | "paid",
  price_note?: string | null,
  locale: Locale = "en",
): string {
  if (typeof window === "undefined") {
    return _formatPrice(price_type, price_note, locale, "Free", "Paid");
  }
  const dict = _getDictionaryClient();
  return _formatPrice(
    price_type,
    price_note,
    locale,
    dict.common.free,
    dict.common.paid,
  );
}

export function isWeekendDate(iso: string): boolean {
  const d = new Date(iso);
  const day = d.getDay();
  return day === 5 || day === 6 || day === 0;
}

export function isUpcoming(iso: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso) >= today;
}

export function relativeTime(iso: string, locale: Locale = "en"): string {
  if (typeof window === "undefined") {
    // Server fallback: use Intl with English locale
    return _relativeTime(iso, locale, enCalFallback, { today: "Today", tomorrow: "Tomorrow" });
  }
  const dict = _getDictionaryClient();
  return _relativeTime(iso, locale, dict.calendar, {
    today: dict.common.todayLabel,
    tomorrow: dict.common.tomorrowLabel,
  });
}

// English calendar stub for server fallbacks. Avoids importing the
// full dict module (which would break client bundle separation).
const enCalFallback: CalendarNames = {
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export function categoryName(
  slug: string,
  lookups: { categories: { slug: string; name: string; name_bn?: string }[] },
  locale: Locale = "en",
): string {
  const found = lookups.categories.find((c) => c.slug === slug);
  if (!found) return slug;
  return locale === "bn" ? (found.name_bn ?? found.name) : found.name;
}

export function tagName(
  slug: string,
  lookups: { audience_tags: { slug: string; name: string; name_bn?: string }[] },
  locale: Locale = "en",
): string {
  const found = lookups.audience_tags.find((t) => t.slug === slug);
  if (!found) return slug;
  return locale === "bn" ? (found.name_bn ?? found.name) : found.name;
}

export function readFiltersFromUrl(params: URLSearchParams): import("./types").EventFilters {
  const rawPreset = params.get("when");
  const preset =
    rawPreset === "today" ||
    rawPreset === "weekend" ||
    rawPreset === "next7" ||
    rawPreset === "next30"
      ? rawPreset
      : undefined;
  const view = params.get("view");

  let dateFrom = params.get("from") ?? undefined;
  let dateTo = params.get("to") ?? undefined;
  if (preset && !dateFrom && !dateTo) {
    const range = datePresetRange(preset);
    dateFrom = range.from;
    dateTo = range.to;
  }

  return {
    city: params.get("city") ?? undefined,
    sub_area: params.get("sub_area") ?? undefined,
    category: params.get("category") ?? undefined,
    audience_tag: params.get("audience_tag") ?? undefined,
    date_from: dateFrom,
    date_to: dateTo,
    date_preset: preset,
    weekend: params.get("weekend") === "true",
    search: params.get("q") ?? undefined,
    featured: params.get("featured") === "true",
    price_type: (params.get("price") as "free" | "paid" | "all" | null) ?? undefined,
    view: view === "list" ? "list" : view === "grid" ? "grid" : undefined,
  };
}

export function datePresetRange(
  preset: "today" | "weekend" | "next7" | "next30",
): { from: string; to: string; label: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const to = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  switch (preset) {
    case "today":
      return { from: to(0), to: to(0), label: "Today" };
    case "weekend": {
      const day = today.getDay();
      let friOffset: number;
      if (day === 5) friOffset = 0;
      else if (day === 6) friOffset = -1;
      else if (day === 0) friOffset = -2;
      else friOffset = 5 - day;
      return { from: to(friOffset), to: to(friOffset + 2), label: "This weekend" };
    }
    case "next7":
      return { from: to(0), to: to(7), label: "Next 7 days" };
    case "next30":
      return { from: to(0), to: to(30), label: "Next 30 days" };
  }
}

export function writeFiltersToUrl(
  base: string,
  filters: Record<string, string | boolean | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === false || v === "" || v === "all") continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export { toBengaliNumerals };
