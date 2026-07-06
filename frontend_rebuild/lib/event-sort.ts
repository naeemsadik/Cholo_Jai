import type { Event } from "@/lib/types";

// ──────────────────────────────────────────────────────────────────────────
// Event sort helpers — pure functions, used by /events for the
// "Sort by" toggle. URL param `?sort=soonest|recent|featured`.
// ──────────────────────────────────────────────────────────────────────────

export type EventSort = "soonest" | "recent" | "featured";

export const SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: "soonest", label: "Soonest" },
  { value: "recent", label: "Recently added" },
  { value: "featured", label: "Featured first" },
];

export function sortEvents(events: Event[], sort: EventSort | undefined): Event[] {
  const out = [...events];
  switch (sort) {
    case "recent":
      // "Recently added" — events with the newest id string first.
      // (We don't have a created_at on every record; id is monotonic.)
      out.sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
      break;
    case "featured":
      out.sort((a, b) => {
        const af = a.is_featured ? 1 : 0;
        const bf = b.is_featured ? 1 : 0;
        if (af !== bf) return bf - af;
        // tiebreaker: soonest first
        return a.start_date.localeCompare(b.start_date);
      });
      break;
    case "soonest":
    default:
      out.sort((a, b) => a.start_date.localeCompare(b.start_date));
      break;
  }
  return out;
}

export function readSortFromParams(params: URLSearchParams): EventSort | undefined {
  const s = params.get("sort");
  if (s === "soonest" || s === "recent" || s === "featured") return s;
  return undefined;
}