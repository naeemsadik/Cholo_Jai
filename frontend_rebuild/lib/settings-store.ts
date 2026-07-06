// Server-side settings store — singleton JSON blob at data/settings.json.
//
// Per the project stance ("no backend yet, laziest thing that works"), this is
// the persistence layer for admin-configurable settings: site identity, outbound
// defaults, tracking pixels, custom meta tags. Reads are cached in-memory for
// 5s so a burst of public-page renders after a settings save all see the new
// values without re-reading the file.
//
// Writes are atomic: we write to settings.json.tmp then fs.rename onto the
// final path. This survives crashes mid-write — readers never see a
// half-written JSON file.
//
// Note: this module uses Node fs APIs and must only be imported from
// server-only contexts (Next.js App Router route handlers, server components).
// Client code should hit /api/settings instead.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { AdminSettings } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
const SETTINGS_TMP_PATH = path.join(DATA_DIR, "settings.json.tmp");

/** Hardcoded defaults — used when the JSON file doesn't exist yet. */
export const DEFAULT_SETTINGS: AdminSettings = {
  site_name: "Ghurighuri",
  tagline: "Your next stop for ghurighuri in Dhaka",
  default_city: "Dhaka",
  default_outbound_label: "Register",
  outbound_labels: [
    "Register",
    "Get Tickets",
    "Learn More",
    "Contact Organizer",
    "View Official Page",
  ],
  pixels: [],
  meta_tags: [],
  updated_at: new Date(0).toISOString(),
};

// In-memory cache — invalidates after CACHE_TTL_MS or on explicit write.
let cache: { data: AdminSettings; loadedAt: number } | null = null;
const CACHE_TTL_MS = 5_000;

/** Force the next readSettings() to hit disk. */
export function invalidateCache(): void {
  cache = null;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Return a deep-merged clone of defaults so callers can't mutate DEFAULT_SETTINGS. */
function freshDefaults(): AdminSettings {
  return {
    ...DEFAULT_SETTINGS,
    outbound_labels: [...DEFAULT_SETTINGS.outbound_labels],
    pixels: [...DEFAULT_SETTINGS.pixels],
    meta_tags: [...DEFAULT_SETTINGS.meta_tags],
  };
}

/**
 * Read current settings from disk. Cached for 5s. Falls back to
 * DEFAULT_SETTINGS if the file doesn't exist or contains malformed JSON —
 * never throws to the caller.
 */
export async function readSettings(): Promise<AdminSettings> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  await ensureDataDir();
  let raw = "";
  try {
    raw = await fs.readFile(SETTINGS_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // First run — return defaults, don't write yet.
      const defaults = freshDefaults();
      cache = { data: defaults, loadedAt: Date.now() };
      return defaults;
    }
    // eslint-disable-next-line no-console
    console.warn("[settings] read failed:", err);
    const defaults = freshDefaults();
    cache = { data: defaults, loadedAt: Date.now() };
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    // Merge with defaults so newly-added fields in code don't break older files.
    const merged: AdminSettings = {
      ...freshDefaults(),
      ...parsed,
      pixels: Array.isArray(parsed.pixels) ? parsed.pixels : [],
      meta_tags: Array.isArray(parsed.meta_tags) ? parsed.meta_tags : [],
    };
    cache = { data: merged, loadedAt: Date.now() };
    return merged;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[settings] JSON parse failed:", err);
    const defaults = freshDefaults();
    cache = { data: defaults, loadedAt: Date.now() };
    return defaults;
  }
}

/**
 * Persist settings atomically. Stamps `updated_at` to now.
 * Returns the persisted value.
 */
export async function writeSettings(
  next: AdminSettings,
): Promise<AdminSettings> {
  await ensureDataDir();
  const stamped: AdminSettings = {
    ...next,
    updated_at: new Date().toISOString(),
  };
  const json = JSON.stringify(stamped, null, 2);
  // Atomic write: write to .tmp, then rename. rename is atomic on POSIX and
  // best-effort atomic on Windows — far better than a half-written final file.
  await fs.writeFile(SETTINGS_TMP_PATH, json, "utf8");
  await fs.rename(SETTINGS_TMP_PATH, SETTINGS_PATH);
  invalidateCache();
  return stamped;
}