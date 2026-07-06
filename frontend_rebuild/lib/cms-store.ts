// CMS store — same pattern as lib/settings-store.ts.
//
// Persistence: a single JSON file at data/cms.json, atomic write through
// `.tmp` + rename. Cached in-memory for 5s.
//
// Schema: two top-level entries:
//   - `pages` — keyed CMS pages (about, etc.). Generic block-based.
//   - `home`  — the homepage section config.
//
// The schema is intentionally simple for the 30-day MVP. New CMS pages
// can be added by inserting entries into the JSON — no code change
// needed; /admin/cms/[pageId] will pick them up automatically.

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CMS_PATH = path.join(DATA_DIR, "cms.json");
const CMS_TMP_PATH = path.join(DATA_DIR, "cms.json.tmp");

// ── Schemas ────────────────────────────────────────────────────────

export type CmsBlock =
  | { kind: "heading"; level: 1 | 2 | 3; en: string; bn?: string }
  | { kind: "paragraph"; en: string; bn?: string }
  | { kind: "faq"; items: { q: { en: string; bn?: string }; a: { en: string; bn?: string } }[] }
  | { kind: "list"; items: { en: string; bn?: string; href?: string }[] }
  | { kind: "image"; src: string; alt: { en: string; bn?: string } };

export interface CmsPage {
  id: string;
  updated_at: string;
  /** Page-specific structured content. Each page defines its own shape. */
  blocks: CmsBlock[];
}

export type HomeSectionId =
  | "hero"
  | "marquee"
  | "mobile_happening_today"
  | "weekend_forecast"
  | "featured_lead"
  | "sector_explorer"
  | "category_explorer"
  | "calendar"
  | "upcoming_grid"
  | "organizer_cta"
  | "newsletter";

export interface HomeSectionConfigBase {
  id: HomeSectionId;
  enabled: boolean;
}

export type HomeSectionConfig =
  | (HomeSectionConfigBase & { id: "hero"; maxItems: number })
  | (HomeSectionConfigBase & { id: "marquee"; items: { en: string; bn?: string }[] })
  | (HomeSectionConfigBase & { id: "mobile_happening_today"; maxItems: number })
  | (HomeSectionConfigBase & { id: "weekend_forecast"; windowDays: 7 | 14 })
  | (HomeSectionConfigBase & {
      id: "featured_lead";
      eyebrow?: { en: string; bn?: string };
      heading?: { en: string; bn?: string };
    })
  | (HomeSectionConfigBase & { id: "sector_explorer"; showCounts: boolean })
  | (HomeSectionConfigBase & { id: "category_explorer"; showCounts: boolean })
  | (HomeSectionConfigBase & { id: "calendar"; showEmptyMonths: boolean })
  | (HomeSectionConfigBase & {
      id: "upcoming_grid";
      defaultView: "grid" | "list";
      pageSize: number;
    })
  | (HomeSectionConfigBase & {
      id: "organizer_cta";
      heading?: { en: string; bn?: string };
      body?: { en: string; bn?: string };
    })
  | (HomeSectionConfigBase & {
      id: "newsletter";
      heading?: { en: string; bn?: string };
      body?: { en: string; bn?: string };
    });

export interface HomePageConfig {
  order: HomeSectionId[];
  sections: Record<HomeSectionId, HomeSectionConfig>;
  updated_at: string;
}

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_HOME_CONFIG: HomePageConfig = {
  order: [
    "hero",
    "marquee",
    "mobile_happening_today",
    "weekend_forecast",
    "featured_lead",
    "sector_explorer",
    "category_explorer",
    "calendar",
    "upcoming_grid",
    "organizer_cta",
    "newsletter",
  ],
  sections: {
    hero: { id: "hero", enabled: true, maxItems: 5 },
    marquee: {
      id: "marquee",
      enabled: true,
      items: [
        { en: "Discover. Explore. Experience." },
        { en: "Your next stop for ghurighuri" },
        { en: "Friday through Sunday — picked for you" },
        { en: "Made with love in Dhaka" },
      ],
    },
    mobile_happening_today: { id: "mobile_happening_today", enabled: true, maxItems: 6 },
    weekend_forecast: { id: "weekend_forecast", enabled: true, windowDays: 7 },
    featured_lead: { id: "featured_lead", enabled: true },
    sector_explorer: { id: "sector_explorer", enabled: true, showCounts: true },
    category_explorer: { id: "category_explorer", enabled: true, showCounts: true },
    calendar: { id: "calendar", enabled: true, showEmptyMonths: false },
    upcoming_grid: { id: "upcoming_grid", enabled: true, defaultView: "grid", pageSize: 12 },
    organizer_cta: { id: "organizer_cta", enabled: true },
    newsletter: { id: "newsletter", enabled: true },
  },
  updated_at: new Date(0).toISOString(),
};

const DEFAULT_ABOUT_BLOCKS: CmsBlock[] = [
  { kind: "heading", level: 1, en: "Hey — we're Ghurighuri." },
  {
    kind: "paragraph",
    en:
      "We're your friend who always knows what's happening around the city. Five hand-picked things to do in Dhaka, every week — no paywalls, no promotional fluff.",
  },
  { kind: "heading", level: 2, en: "Curated, not exhaustive." },
  {
    kind: "paragraph",
    en:
      "Dhaka has more events than anyone could ever attend. We're not trying to list all of them — we want to surface the ones worth showing up for.",
  },
  { kind: "heading", level: 2, en: "The questions we get most." },
  {
    kind: "faq",
    items: [
      {
        q: { en: "What is Ghurighuri?" },
        a: {
          en:
            "Ghurighuri is a curated weekly guide to events, places, and experiences in Dhaka, Bangladesh. We hand-pick five things worth stepping out for every week.",
        },
      },
      {
        q: { en: "How do I get tickets?" },
        a: {
          en:
            "Ghurighuri does not sell tickets. Tap the outbound CTA on an event page and we send you straight to the organizer's official page.",
        },
      },
    ],
  },
];

export const DEFAULT_CMS_STATE: { pages: Record<string, CmsPage>; home: HomePageConfig } = {
  pages: {
    about: {
      id: "about",
      updated_at: new Date(0).toISOString(),
      blocks: DEFAULT_ABOUT_BLOCKS,
    },
  },
  home: DEFAULT_HOME_CONFIG,
};

// ── Cache + I/O ────────────────────────────────────────────────────

interface CmsState {
  pages: Record<string, CmsPage>;
  home: HomePageConfig;
}

let cache: { data: CmsState; loadedAt: number } | null = null;
const CACHE_TTL_MS = 5_000;

export function invalidateCmsCache(): void {
  cache = null;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readCms(): Promise<CmsState> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.data;
  }
  await ensureDataDir();
  let raw = "";
  try {
    raw = await fs.readFile(CMS_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const fresh = freshDefaults();
      cache = { data: fresh, loadedAt: Date.now() };
      return fresh;
    }
    // eslint-disable-next-line no-console
    console.warn("[cms] read failed:", err);
    const fresh = freshDefaults();
    cache = { data: fresh, loadedAt: Date.now() };
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    const merged: CmsState = {
      pages: parsed.pages ?? {},
      home: mergeHome(parsed.home),
    };
    cache = { data: merged, loadedAt: Date.now() };
    return merged;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[cms] JSON parse failed:", err);
    const fresh = freshDefaults();
    cache = { data: fresh, loadedAt: Date.now() };
    return fresh;
  }
}

function mergeHome(input: Partial<HomePageConfig> | undefined): HomePageConfig {
  if (!input) return DEFAULT_HOME_CONFIG;
  return {
    order: Array.isArray(input.order) ? input.order : DEFAULT_HOME_CONFIG.order,
    sections: {
      ...DEFAULT_HOME_CONFIG.sections,
      ...(input.sections ?? {}),
    } as HomePageConfig["sections"],
    updated_at: input.updated_at ?? DEFAULT_HOME_CONFIG.updated_at,
  };
}

function freshDefaults(): CmsState {
  return {
    pages: JSON.parse(JSON.stringify(DEFAULT_CMS_STATE.pages)) as Record<string, CmsPage>,
    home: JSON.parse(JSON.stringify(DEFAULT_CMS_STATE.home)) as HomePageConfig,
  };
}

export async function writeCms(next: CmsState): Promise<CmsState> {
  await ensureDataDir();
  const stamped: CmsState = {
    ...next,
    home: { ...next.home, updated_at: new Date().toISOString() },
  };
  const json = JSON.stringify(stamped, null, 2);
  await fs.writeFile(CMS_TMP_PATH, json, "utf8");
  await fs.rename(CMS_TMP_PATH, CMS_PATH);
  invalidateCmsCache();
  return stamped;
}

// ── Page-specific helpers ─────────────────────────────────────────

export async function readCmsPage(id: string): Promise<CmsPage | null> {
  const state = await readCms();
  return state.pages[id] ?? null;
}

export async function writeCmsPage(id: string, blocks: CmsBlock[]): Promise<CmsPage> {
  const state = await readCms();
  const next: CmsPage = {
    id,
    updated_at: new Date().toISOString(),
    blocks,
  };
  state.pages[id] = next;
  await writeCms(state);
  return next;
}

export async function readHomeConfig(): Promise<HomePageConfig> {
  const state = await readCms();
  return state.home;
}

export async function writeHomeConfig(next: HomePageConfig): Promise<HomePageConfig> {
  const state = await readCms();
  const stamped: HomePageConfig = {
    ...next,
    updated_at: new Date().toISOString(),
  };
  state.home = stamped;
  await writeCms(state);
  return stamped;
}
