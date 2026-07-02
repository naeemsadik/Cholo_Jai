import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in editorial style — e.g. "Fri · 12 Jul · 7:30 PM"
export function formatEventDate(iso: string, time?: string): string {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    if (!time) return dateStr;
    return `${dateStr} · ${formatTime(time)}`;
  } catch {
    return iso;
  }
}

export function formatTime(hhmm: string): string {
  try {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  } catch {
    return hhmm;
  }
}

export function formatPrice(price_type: "free" | "paid", price_note?: string | null): string {
  if (price_type === "free") return "Free";
  return price_note || "Paid";
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

export function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) > 30) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

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

// Convert slugs to display names by joining with lookup table
export function categoryName(slug: string, lookups: { categories: { slug: string; name: string }[] }): string {
  return lookups.categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function tagName(slug: string, lookups: { audience_tags: { slug: string; name: string }[] }): string {
  return lookups.audience_tags.find((t) => t.slug === slug)?.name ?? slug;
}

// Read filters from URL search params
export function readFiltersFromUrl(params: URLSearchParams) {
  return {
    city: params.get("city") ?? undefined,
    sub_area: params.get("sub_area") ?? undefined,
    category: params.get("category") ?? undefined,
    audience_tag: params.get("audience_tag") ?? undefined,
    date_from: params.get("from") ?? undefined,
    date_to: params.get("to") ?? undefined,
    weekend: params.get("weekend") === "true",
    search: params.get("q") ?? undefined,
    featured: params.get("featured") === "true",
    price_type: (params.get("price") as "free" | "paid" | "all" | null) ?? undefined,
  };
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