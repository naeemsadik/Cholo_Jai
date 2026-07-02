// Type definitions mirroring PRD §8.3 data models
// Keep these DB-agnostic and serializable

export type EventStatus =
  | "draft"
  | "submitted"
  | "published"
  | "unpublished"
  | "archived"
  | "rejected";

export type PriceType = "free" | "paid";

export type OutboundButtonLabel =
  | "Register"
  | "Get Tickets"
  | "Learn More"
  | "Contact Organizer"
  | "View Official Page";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface AudienceTag {
  id: string;
  name: string;
  slug: string;
}

export interface SubArea {
  id: string;
  city: string;
  name: string;
  slug: string;
}

export interface Organizer {
  name: string;
  phone?: string | null;
  email?: string | null;
  social_link?: string | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster_url: string;
  start_date: string; // ISO date e.g. "2026-07-12"
  start_time: string; // "HH:MM" 24h
  end_date?: string | null;
  end_time?: string | null;
  city: string;
  sub_area: string;
  venue_name: string;
  area_details: string;
  maps_link?: string | null;
  categories: string[]; // category slugs
  audience_tags?: string[]; // tag slugs
  price_type: PriceType;
  price_note?: string | null;
  organizer: Organizer;
  outbound_link: string;
  outbound_button_label: OutboundButtonLabel;
  source_link?: string | null; // internal only
  admin_notes?: string | null; // internal only
  is_featured: boolean;
  is_recommended: boolean;
  status: EventStatus;
  expected_attendance?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  // Same fields as Event, but for un-reviewed submissions
  id: string;
  title: string;
  description: string;
  poster_url?: string | null;
  start_date: string;
  start_time: string;
  end_date?: string | null;
  end_time?: string | null;
  city: string;
  sub_area: string;
  venue_name: string;
  area_details: string;
  maps_link?: string | null;
  categories: string[];
  audience_tags?: string[];
  price_type: PriceType;
  price_note?: string | null;
  organizer: Organizer & { phone: string }; // phone required for submissions
  outbound_link: string;
  expected_attendance?: number | null;
  wants_promotion_support: boolean;
  additional_notes?: string | null;
  review_status: "submitted" | "approved" | "rejected" | "needs_info";
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Filter state — URL-syncable
export interface EventFilters {
  city?: string;
  sub_area?: string;
  category?: string;
  audience_tag?: string;
  date_from?: string;
  date_to?: string;
  weekend?: boolean;
  search?: string;
  featured?: boolean;
  price_type?: PriceType | "all";
}

export interface EmailSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: "page_view" | "outbound_click" | "form_submit" | "subscribe";
  event_id?: string | null; // FK to Event/Submission
  referrer?: string | null;
  source?: string | null; // utm_source e.g. "instagram"
  path?: string;
  created_at: string;
}

// Lookup / catalog responses
export interface Lookups {
  categories: Category[];
  audience_tags: AudienceTag[];
  sub_areas: SubArea[];
  cities: string[];
}