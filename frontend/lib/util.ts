import { categories, audienceTags, subAreas } from "./fallback-data";

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
export function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .toUpperCase();
}
export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = Number(h);
  const ampm = hh >= 12 ? "PM" : "AM";
  const hh12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hh12}:${m} ${ampm}`;
}
export function dayMonth(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  return { day, mon };
}

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
export const tagBySlug = (slug: string) =>
  audienceTags.find((t) => t.slug === slug);
export const subAreaNames = () => subAreas.map((s) => s.name);

export function clsx(...xs: (string | false | undefined | null)[]) {
  return xs.filter(Boolean).join(" ");
}