// Centralized lookups — used both by API client and fallback data
// Mirrors PRD §11
//
// Every label has an English `name` and a Bangla `name_bn`. The Bangla form
// is the display name for our default locale (bn). For sub-areas, place
// names (e.g. "Dhanmondi") are commonly kept in Latin transliteration by
// Dhaka residents — we use the official Bangla spellings but never force
// them; the system falls back to the Latin name silently if the Bangla
// name is empty for any reason.

import type { Locale } from "./i18n/types";

export interface CategoryEntry {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
}

export const CATEGORIES: readonly CategoryEntry[] = [
  { id: "cat-workshops", name: "Workshops", name_bn: "কর্মশালা", slug: "workshops" },
  { id: "cat-seminars", name: "Seminars", name_bn: "সেমিনার", slug: "seminars" },
  { id: "cat-university", name: "University events", name_bn: "বিশ্ববিদ্যালয়ের ইভেন্ট", slug: "university-events" },
  { id: "cat-student", name: "Student events", name_bn: "ছাত্র-ছাত্রীদের ইভেন্ট", slug: "student-events" },
  { id: "cat-family", name: "Family events", name_bn: "পরিবারের জন্য", slug: "family-events" },
  { id: "cat-weekend", name: "Weekend events", name_bn: "সপ্তাহান্তের ইভেন্ট", slug: "weekend-events" },
  { id: "cat-concerts", name: "Concerts", name_bn: "কনসার্ট", slug: "concerts" },
  { id: "cat-exhibitions", name: "Exhibitions", name_bn: "প্রদর্শনী", slug: "exhibitions" },
  { id: "cat-food", name: "Food events", name_bn: "খাবারের ইভেন্ট", slug: "food-events" },
  { id: "cat-sports", name: "Sports", name_bn: "খেলা", slug: "sports" },
  { id: "cat-islamic", name: "Islamic & community", name_bn: "ইসলামিক ও কমিউনিটি", slug: "islamic-community" },
  { id: "cat-free", name: "Free events", name_bn: "ফ্রি ইভেন্ট", slug: "free-events" },
] as const;

export interface AudienceTagEntry {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
}

export const AUDIENCE_TAGS: readonly AudienceTagEntry[] = [
  { id: "tag-family", name: "Family", name_bn: "পরিবার", slug: "family" },
  { id: "tag-couples", name: "Couples", name_bn: "দম্পতি", slug: "couples" },
  { id: "tag-friends", name: "Friends", name_bn: "বন্ধুরা", slug: "friends" },
  { id: "tag-students", name: "Students", name_bn: "শিক্ষার্থী", slug: "students" },
  { id: "tag-professionals", name: "Professionals", name_bn: "পেশাজীবী", slug: "professionals" },
  { id: "tag-women", name: "Women-friendly", name_bn: "নারী-বান্ধব", slug: "women-friendly" },
  { id: "tag-kids", name: "Kids-friendly", name_bn: "শিশু-বান্ধব", slug: "kids-friendly" },
  { id: "tag-solo", name: "Solo-friendly", name_bn: "একা যাওয়া যায়", slug: "solo-friendly" },
  { id: "tag-budget", name: "Budget-friendly", name_bn: "কম খরচে", slug: "budget-friendly" },
  { id: "tag-free-entry", name: "Free entry", name_bn: "ফ্রি প্রবেশ", slug: "free-entry" },
  { id: "tag-indoor", name: "Indoor", name_bn: "ইনডোর", slug: "indoor" },
  { id: "tag-outdoor", name: "Outdoor", name_bn: "আউটডোর", slug: "outdoor" },
] as const;

export const SUB_AREAS_DHAKA = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Mirpur",
  "Bashundhara",
  "Mohammadpur",
  "Tejgaon",
  "Farmgate",
  "Motijheel",
  "Old Dhaka",
  "Hatirjheel",
  "Baily Road",
  "Purbachal",
  "Dhaka University area",
  "Other",
] as const;

// Bangla place-name spellings. Most are official transliterations kept
// recognisable to a Dhaka Bangla reader; "Old Dhaka" is a culturally
// significant case — it's the historic "পুরান ঢাকা" area.
export const SUB_AREAS_DHAKA_BN: Record<(typeof SUB_AREAS_DHAKA)[number], string> = {
  "Gulshan": "গুলশান",
  "Banani": "বনানী",
  "Dhanmondi": "ধানমন্ডি",
  "Uttara": "উত্তরা",
  "Mirpur": "মিরপুর",
  "Bashundhara": "বসুন্ধরা",
  "Mohammadpur": "মোহাম্মদপুর",
  "Tejgaon": "তেজগাঁও",
  "Farmgate": "ফার্মগেট",
  "Motijheel": "মতিঝিল",
  "Old Dhaka": "পুরান ঢাকা",
  "Hatirjheel": "হাতিরঝিল",
  "Baily Road": "বেইলি রোড",
  "Purbachal": "পূর্বাচল",
  "Dhaka University area": "ঢাকা বিশ্ববিদ্যালয় এলাকা",
  "Other": "অন্যান্য",
};

export const SUB_AREAS = SUB_AREAS_DHAKA.map((name, i) => ({
  id: `sub-${i + 1}`,
  city: "Dhaka",
  name,
  name_bn: SUB_AREAS_DHAKA_BN[name] ?? name,
  slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
}));

export const CITIES = ["Dhaka"] as const;

export interface OutboundLabelEntry {
  value: string;
  name: string;
  name_bn: string;
}

export const OUTBOUND_BUTTON_LABELS: readonly OutboundLabelEntry[] = [
  { value: "Register", name: "Register", name_bn: "নিবন্ধন করুন" },
  { value: "Get Tickets", name: "Get Tickets", name_bn: "টিকিট নিন" },
  { value: "Learn More", name: "Learn More", name_bn: "আরও জানুন" },
  { value: "Contact Organizer", name: "Contact Organizer", name_bn: "আয়োজকের সাথে যোগাযোগ" },
  { value: "View Official Page", name: "View Official Page", name_bn: "অফিসিয়াল পেজ দেখুন" },
] as const;

// Hand-curated editorial display order for the homepage SectorExplorer.
// Deliberately not alphabetical nor count-derived — represents the order a
// Dhaka reader would scan the city. See PRD §4.1 home + §11 sub-areas.
export const SUB_AREAS_DHAKA_ORDER: readonly string[] = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Old Dhaka",
  "Mohammadpur",
  "Mirpur",
  "Bashundhara",
  "Tejgaon",
  "Farmgate",
  "Motijheel",
  "Hatirjheel",
  "Baily Road",
  "Purbachal",
  "Dhaka University area",
  "Other",
];

// Returns the editorial order for any sub-area array, falling back to alphabetic.
export function sortSubAreasByEditorial(names: readonly string[]): string[] {
  const orderIdx = new Map(SUB_AREAS_DHAKA_ORDER.map((n, i) => [n, i] as const));
  return [...names].sort((a, b) => {
    const ai = orderIdx.has(a) ? (orderIdx.get(a) as number) : 999;
    const bi = orderIdx.has(b) ? (orderIdx.get(b) as number) : 999;
    return ai - bi;
  });
}

// ── Locale-aware resolvers ─────────────────────────────────────────
//
// These helpers are the only sanctioned way to display a category/tag/area
// name in the UI. They take the active locale and return the matching
// string, falling back to the Latin name if a Bangla form is missing.

export function tCategory(slug: string, locale: Locale): string {
  const found = CATEGORIES.find((c) => c.slug === slug);
  if (!found) return slug;
  return locale === "bn" ? found.name_bn : found.name;
}

export function tAudienceTag(slug: string, locale: Locale): string {
  const found = AUDIENCE_TAGS.find((t) => t.slug === slug);
  if (!found) return slug;
  return locale === "bn" ? found.name_bn : found.name;
}

export function tSubArea(name: string, locale: Locale): string {
  if (locale !== "bn") return name;
  return SUB_AREAS_DHAKA_BN[name as (typeof SUB_AREAS_DHAKA)[number]] ?? name;
}

export function tOutboundLabel(value: string, locale: Locale): string {
  const found = OUTBOUND_BUTTON_LABELS.find((l) => l.value === value);
  if (!found) return value;
  return locale === "bn" ? found.name_bn : found.name;
}
