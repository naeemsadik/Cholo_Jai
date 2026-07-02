// Centralized lookups — used both by API client and fallback data
// Mirrors PRD §11

export const CATEGORIES = [
  { id: "cat-workshops", name: "Workshops", slug: "workshops" },
  { id: "cat-seminars", name: "Seminars", slug: "seminars" },
  { id: "cat-university", name: "University events", slug: "university-events" },
  { id: "cat-student", name: "Student events", slug: "student-events" },
  { id: "cat-family", name: "Family events", slug: "family-events" },
  { id: "cat-weekend", name: "Weekend events", slug: "weekend-events" },
  { id: "cat-concerts", name: "Concerts", slug: "concerts" },
  { id: "cat-exhibitions", name: "Exhibitions", slug: "exhibitions" },
  { id: "cat-food", name: "Food events", slug: "food-events" },
  { id: "cat-sports", name: "Sports", slug: "sports" },
  { id: "cat-islamic", name: "Islamic & community", slug: "islamic-community" },
  { id: "cat-free", name: "Free events", slug: "free-events" },
] as const;

export const AUDIENCE_TAGS = [
  { id: "tag-family", name: "Family", slug: "family" },
  { id: "tag-couples", name: "Couples", slug: "couples" },
  { id: "tag-friends", name: "Friends", slug: "friends" },
  { id: "tag-students", name: "Students", slug: "students" },
  { id: "tag-professionals", name: "Professionals", slug: "professionals" },
  { id: "tag-women", name: "Women-friendly", slug: "women-friendly" },
  { id: "tag-kids", name: "Kids-friendly", slug: "kids-friendly" },
  { id: "tag-solo", name: "Solo-friendly", slug: "solo-friendly" },
  { id: "tag-budget", name: "Budget-friendly", slug: "budget-friendly" },
  { id: "tag-free-entry", name: "Free entry", slug: "free-entry" },
  { id: "tag-indoor", name: "Indoor", slug: "indoor" },
  { id: "tag-outdoor", name: "Outdoor", slug: "outdoor" },
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

export const SUB_AREAS = SUB_AREAS_DHAKA.map((name, i) => ({
  id: `sub-${i + 1}`,
  city: "Dhaka",
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
}));

export const CITIES = ["Dhaka"] as const;

export const OUTBOUND_BUTTON_LABELS = [
  "Register",
  "Get Tickets",
  "Learn More",
  "Contact Organizer",
  "View Official Page",
] as const;