// Resolve a possibly-bilingual Event/Submission to a single set of
// display strings for the active locale. Bangla fields are preferred
// when present; the Latin original is the silent fallback so an event
// with no Bangla title still renders correctly.

import type { Event, Submission } from "../types";
import type { Locale } from "./types";

export interface LocalizedEvent {
  title: string;
  description: string;
  venue_name: string;
  area_details: string;
  poster_alt: string;
  /** True when at least one Bangla field is non-empty (proves the event
   *  was intentionally localized, not just rendering the fallback). */
  isLocalized: boolean;
}

const isNonEmpty = (v: string | null | undefined): v is string =>
  typeof v === "string" && v.trim().length > 0;

/**
 * Pick the localized string from a `{ en, bn? }` pair. Bangla wins when
 * non-empty AND locale is "bn"; otherwise English. Centralized so the
 * fallback rule is consistent across the app.
 */
export function pick(
  pair: { en: string; bn?: string | null },
  locale: Locale,
): string {
  if (locale === "bn" && isNonEmpty(pair.bn)) return pair.bn as string;
  return pair.en;
}

export function localizeEvent(e: Event, locale: Locale): LocalizedEvent {
  if (locale !== "bn") {
    return {
      title: e.title,
      description: e.description,
      venue_name: e.venue_name,
      area_details: e.area_details,
      poster_alt: e.poster_alt ?? e.title,
      isLocalized: false,
    };
  }
  return {
    title: isNonEmpty(e.title_bn) ? e.title_bn : e.title,
    description: isNonEmpty(e.description_bn) ? e.description_bn : e.description,
    venue_name: isNonEmpty(e.venue_name_bn) ? e.venue_name_bn : e.venue_name,
    area_details: isNonEmpty(e.area_details_bn) ? e.area_details_bn : e.area_details,
    poster_alt: isNonEmpty(e.poster_alt_bn)
      ? e.poster_alt_bn
      : e.poster_alt ?? e.title,
    isLocalized:
      isNonEmpty(e.title_bn) ||
      isNonEmpty(e.description_bn) ||
      isNonEmpty(e.venue_name_bn),
  };
}

export function localizeSubmission(
  s: Submission,
  locale: Locale,
): LocalizedEvent {
  if (locale !== "bn") {
    return {
      title: s.title,
      description: s.description,
      venue_name: s.venue_name,
      area_details: s.area_details,
      poster_alt: s.title,
      isLocalized: false,
    };
  }
  return {
    title: isNonEmpty(s.title_bn) ? s.title_bn : s.title,
    description: isNonEmpty(s.description_bn) ? s.description_bn : s.description,
    venue_name: isNonEmpty(s.venue_name_bn) ? s.venue_name_bn : s.venue_name,
    area_details: isNonEmpty(s.area_details_bn) ? s.area_details_bn : s.area_details,
    poster_alt: s.title,
    isLocalized:
      isNonEmpty(s.title_bn) ||
      isNonEmpty(s.description_bn) ||
      isNonEmpty(s.venue_name_bn),
  };
}

/** Lightweight shorthand for the most-used field. */
export function tEventTitle(e: Event, locale: Locale): string {
  return locale === "bn" && isNonEmpty(e.title_bn) ? e.title_bn : e.title;
}

/** Compute a translation coverage % for an event. Used by admin UI to
 *  show how much of the event has been translated. */
export function translationCoverage(e: Event): number {
  const fields: Array<string | null | undefined> = [
    e.title_bn,
    e.description_bn,
    e.venue_name_bn,
    e.area_details_bn,
  ];
  const filled = fields.filter(isNonEmpty).length;
  return Math.round((filled / fields.length) * 100);
}
