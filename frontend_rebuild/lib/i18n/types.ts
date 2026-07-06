// i18n core types — single source of truth for the locale system.
//
// Locale is a cookie (cj_locale). The default is Bangla per product spec.
// Public pages are server-rendered; the locale must be read server-side so
// the first paint is in the right language (no English flash before JS picks
// the right dictionary). Crawlers always see English (see bot-detection in
// app/layout.tsx) — Bangla pages are not URL-addressable in the MVP, so we
// don't emit hreflang for bn.

import type { Dictionary } from "./types-dict";

export type { Dictionary };

export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "bn";
export const COOKIE_KEY = "cj_locale";

/** User agents we always serve English to (SEO + GEO). */
const BOT_REGEX =
  /(googlebot|bingbot|duckduckbot|yandexbot|baiduspider|applebot|petalbot|slackbot|twitterbot|facebookexternalhit|linkedinbot|whatsapp|telegrambot|embedly|discordbot|skypeuripreview|redditbot)/i;

export function isCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}

/** Parse a cookie header for the locale. Falls back to default. */
export function parseLocaleFromCookieHeader(
  cookieHeader: string | null | undefined,
): Locale {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const m = cookieHeader.match(/(?:^|;\s*)cj_locale=([^;]+)/);
  if (!m) return DEFAULT_LOCALE;
  const raw = decodeURIComponent(m[1]).trim().toLowerCase();
  return raw === "en" ? "en" : "bn";
}

/** Mirror of parseLocaleFromCookieHeader for `cookies()` API. */
export function parseLocaleFromCookieValue(
  value: string | undefined,
): Locale {
  if (!value) return DEFAULT_LOCALE;
  return value.trim().toLowerCase() === "en" ? "en" : "bn";
}

/** Human-readable name of a locale in its own language. */
export const LOCALE_LABEL: Record<Locale, string> = {
  bn: "বাংলা",
  en: "EN",
};

/** English label for the locale (used in admin/JSON). */
export const LOCALE_LABEL_EN: Record<Locale, string> = {
  bn: "Bangla",
  en: "English",
};
