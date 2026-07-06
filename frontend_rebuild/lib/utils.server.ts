// Server-only formatters — same API as utils.ts but the locale is
// resolved from the request automatically. Server components that have
// already resolved the locale can pass it explicitly via the wrapper in
// utils.ts to avoid an extra `getLocaleFromHeaders()` call per render.
//
// Use this file from server components only.

import { getDictionary, getLocaleFromHeaders } from "./i18n/server";
import {
  formatEventDate as _formatEventDate,
  formatTime as _formatTime,
  formatPrice as _formatPrice,
  relativeTime as _relativeTime,
} from "./i18n/format";
import type { Locale } from "./i18n/types";

export async function formatEventDateServer(
  iso: string,
  time?: string,
  locale?: Locale,
): Promise<string> {
  const loc = locale ?? (await getLocaleFromHeaders());
  const dict = getDictionary(loc);
  return _formatEventDate(iso, time, loc, dict.calendar, dict.common.free, dict.common.paid);
}

export function formatEventDateWithLocale(
  iso: string,
  time: string | undefined,
  locale: Locale,
): string {
  const dict = getDictionary(locale);
  return _formatEventDate(iso, time, locale, dict.calendar, dict.common.free, dict.common.paid);
}

export function formatTimeWithLocale(hhmm: string, locale: Locale): string {
  return _formatTime(hhmm, locale);
}

export function formatPriceWithLocale(
  price_type: "free" | "paid",
  price_note: string | null | undefined,
  locale: Locale,
): string {
  const dict = getDictionary(locale);
  return _formatPrice(price_type, price_note, locale, dict.common.free, dict.common.paid);
}

export function relativeTimeWithLocale(iso: string, locale: Locale): string {
  const dict = getDictionary(locale);
  return _relativeTime(iso, locale, dict.calendar, {
    today: dict.common.todayLabel,
    tomorrow: dict.common.tomorrowLabel,
  });
}
