// Client-side i18n: `useT()` hook + `I18nProvider`.
//
// Use in client components:
//   const t = useT();
//   <h1>{t("home", "heroH1")}</h1>
//
// For nested keys we use a simple dot-path: "home.heroH1", "nav.allEvents".
// This keeps the call site readable and avoids passing the whole dictionary
// to every component.

"use client";

import * as React from "react";
import type { Dictionary } from "./types-dict";
import type { Locale } from "./types";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locale, dict }), [locale, dict]);
  React.useEffect(() => {
    setActiveDictionary(locale, dict);
  }, [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    // Outside provider — return a Bangla default so we never throw in
    // unusual render paths. The root layout always provides one.
    return { locale: "bn", dict: bnFallbackDict };
  }
  return ctx;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useDict(): Dictionary {
  return useI18n().dict;
}

/**
 * Imperative accessor for the active dictionary outside React.
 * Reads from a module-level slot that the provider writes to on mount.
 * Falls back to a stub dict if called before the provider mounts.
 *
 * Used by lib/utils.ts to expose locale-aware formatters that work
 * from any client component without prop-drilling.
 *
 * Accepts an optional explicit dictionary to support server contexts
 * where the active provider hasn't mounted yet (e.g. server-side helper
 * wrappers in utils.ts).
 */
let _activeDict: Dictionary | null = null;
let _activeLocale: Locale | null = null;

export function setActiveDictionary(locale: Locale, dict: Dictionary): void {
  _activeLocale = locale;
  _activeDict = dict;
}

export function getActiveDictionary(_dict?: Dictionary): Dictionary {
  if (_dict) return _dict;
  if (_activeDict) return _activeDict;
  return bnFallbackDict;
}

export function getActiveLocale(): Locale {
  return _activeLocale ?? "bn";
}

type Path<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly unknown[]
      ? K
      : T[K] extends object
        ? `${K}.${Path<T[K]>}`
        : K;
}[keyof T & string];

export type DictKey = Path<Dictionary>;

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Interpolate `{name}` placeholders in a string with values.
 *   t("home", "thingsWorthStepping", { n: 12 }) => "১২টি ঘুরে আসার মতো জায়গা"
 */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return String(vars[name]);
    }
    return `{${name}}`;
  });
}

/**
 * Translate a key. Returns the raw string, optionally with variable
 * interpolation. Falls back to the key path itself if the key is missing
 * (so a missing key shows up as `home.heroH1` rather than crashing).
 *
 * For arrays (e.g. marquee items) interpolation still works element-wise.
 */
export function useT() {
  const { dict } = useI18n();

  return function t<K extends DictKey>(
    section: K extends `${infer S}.${string}` ? S : never,
    key: K extends `${string}.${infer K2}` ? K2 : K,
    vars?: Record<string, string | number>,
  ): string {
    const path = `${section}.${key}`;
    const value = getPath(dict, path);
    if (typeof value === "string") return interpolate(value, vars);
    if (Array.isArray(value)) {
      // For arrays of strings, join with a separator. Callers who want
      // a specific element should index into the dict directly.
      return value.map((v) => (typeof v === "string" ? interpolate(v, vars) : "")).join(" · ");
    }
    return path;
  };
}

// ── Fallback dict (used only if a client component is rendered outside
// the provider, e.g. an error boundary). Kept as a thin stub so we never
// crash. The real dictionaries live in en.ts / bn.ts.
const bnFallbackDict: Dictionary = new Proxy({} as Dictionary, {
  get: (_t, prop: string) => {
    if (prop === "calendar" || prop === "about") {
      return new Proxy({} as never, { get: (_, p2: string) => (Array.isArray(({} as never)[p2]) ? [] : `[${prop}.${p2}]`) });
    }
    return new Proxy({} as never, { get: (_, p2: string) => `[${prop}.${p2}]` });
  },
});
