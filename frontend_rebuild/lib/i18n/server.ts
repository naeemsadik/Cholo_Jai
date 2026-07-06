// Server-side i18n: read the locale, return the dictionary, and resolve
// a "Server T" that components can use without the React provider.
//
// Public pages are server components. They don't have access to React
// context, so we expose:
//   - `getDictionary(locale)` — returns the static dict
//   - `t()` — a function bound to a dict, for use inside server components
//   - `getLocaleFromRequest(req)` — reads the cookie from a NextRequest
//   - `getLocaleFromHeaders()` — reads the cookie from next/headers

import { headers, cookies } from "next/headers";
import { en } from "./en";
import { bn } from "./bn";
import { DEFAULT_LOCALE, parseLocaleFromCookieValue, parseLocaleFromCookieHeader, isCrawler, type Locale } from "./types";
import type { Dictionary } from "./types-dict";

export const dictionaries: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/**
 * Server-side: figure out the active locale for this request.
 *
 * Order of precedence:
 *   1. cj_locale cookie (user's explicit choice)
 *   2. Bangla default (per product spec)
 *   3. If User-Agent is a known crawler → always English (for SEO/GEO)
 */
export async function getLocaleFromHeaders(): Promise<Locale> {
  const c = await cookies();
  const cookieVal = c.get("cj_locale")?.value;
  const fromCookie = parseLocaleFromCookieValue(cookieVal);
  if (fromCookie !== DEFAULT_LOCALE) return fromCookie;
  // Default is bn; check the UA to override to en for crawlers
  const h = await headers();
  const ua = h.get("user-agent");
  if (isCrawler(ua)) return "en";
  return fromCookie;
}

/** Edge-friendly variant: read the cookie from a NextRequest. */
export function getLocaleFromRequest(req: Request): Locale {
  const cookieHeader = req.headers.get("cookie");
  const fromCookie = parseLocaleFromCookieHeader(cookieHeader);
  if (fromCookie !== DEFAULT_LOCALE) return fromCookie;
  const ua = req.headers.get("user-agent");
  if (isCrawler(ua)) return "en";
  return fromCookie;
}

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return `{${name}}`;
  });
}

export type ServerT = {
  <K extends string>(path: K, vars?: Record<string, string | number>): string;
  /** The bound locale — useful for components that branch on language. */
  locale: Locale;
  /** The bound dictionary — useful when a component needs an array (e.g. FAQ). */
  dict: Dictionary;
};

export function makeT(locale: Locale, dict: Dictionary): ServerT {
  const fn = ((path: string, vars?: Record<string, string | number>) => {
    const value = getPath(dict, path);
    if (typeof value === "string") return interpolate(value, vars);
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === "string" ? interpolate(v, vars) : "")).join(" · ");
    }
    return path;
  }) as ServerT;
  fn.locale = locale;
  fn.dict = dict;
  return fn;
}

/** Convenience: `const t = await serverT()` inside an async server component. */
export async function serverT(): Promise<ServerT> {
  const locale = await getLocaleFromHeaders();
  return makeT(locale, getDictionary(locale));
}
