// Locale-aware formatters that are safe to import from client code.
//
// We don't import getDictionary from ./server (it pulls in next/headers).
// Instead, callers pass a small static table — typically the dict.calendar
// section. This keeps client bundles free of server-only modules.

import type { Locale } from "./types";

export interface CalendarNames {
  days: readonly string[];
  daysShort: readonly string[];
  months: readonly string[];
  monthsShort: readonly string[];
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumerals(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

function bnNum(n: number): string {
  return toBengaliNumerals(n);
}

/**
 * Format an ISO date string with locale awareness.
 *
 * Bangla output is "শুক্রবার, ১২ জুলাই ২০২৬" (Bengali numerals, Bangla day/month
 * names). English output is the existing editorial "Fri, 12 Jul · 19:30" form.
 */
export function formatEventDate(
  iso: string,
  time: string | undefined,
  locale: Locale,
  cal: CalendarNames,
  freeWord: string,
  paidWord: string,
): string {
  try {
    const d = new Date(iso);
    if (locale === "bn") {
      const dayName = cal.days[d.getDay()];
      const monthName = cal.months[d.getMonth()];
      const dateStr = `${dayName}, ${bnNum(d.getDate())} ${monthName} ${bnNum(d.getFullYear())}`;
      if (!time) return dateStr;
      return `${dateStr} · ${formatTime(time, locale)}`;
    }
    const dateStr = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    if (!time) return dateStr;
    return `${dateStr} · ${formatTime(time, locale)}`;
  } catch {
    return iso;
  }
}

export function formatTime(hhmm: string, locale: Locale): string {
  try {
    const [h, m] = hhmm.split(":").map(Number);
    if (locale === "bn") {
      return `${bnNum(h)}:${bnNum(m)}`;
    }
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  } catch {
    return hhmm;
  }
}

export function formatPrice(
  price_type: "free" | "paid",
  price_note: string | null | undefined,
  locale: Locale,
  freeWord: string,
  paidWord: string,
): string {
  if (price_type === "free") return freeWord;
  if (!price_note) return paidWord;
  if (locale === "bn") {
    return toBengaliNumerals(price_note);
  }
  return price_note;
}

export function relativeTime(
  iso: string,
  locale: Locale,
  cal: CalendarNames,
  labels: {
    today: string;
    tomorrow: string;
  },
): string {
  const d = new Date(iso);
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) > 30) {
    if (locale === "bn") {
      const monthName = cal.months[d.getMonth()];
      return `${bnNum(d.getDate())} ${monthName} ${bnNum(d.getFullYear())}`;
    }
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.tomorrow;
  if (diffDays === -1) return locale === "bn" ? "গতকাল" : "Yesterday";
  if (diffDays > 0 && diffDays < 7) {
    return locale === "bn"
      ? `${bnNum(diffDays)} দিন পরে`
      : `In ${diffDays} days`;
  }
  if (diffDays < 0 && diffDays > -7) {
    return locale === "bn"
      ? `${bnNum(Math.abs(diffDays))} দিন আগে`
      : `${Math.abs(diffDays)} days ago`;
  }
  if (locale === "bn") {
    const monthName = cal.monthsShort[d.getMonth()];
    return `${bnNum(d.getDate())} ${monthName}`;
  }
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
