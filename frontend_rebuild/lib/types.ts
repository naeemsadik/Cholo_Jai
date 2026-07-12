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
  title_bn?: string | null; // optional Bangla title — falls back to `title` if empty
  slug: string;
  description: string;
  description_bn?: string | null; // optional Bangla description
  poster_url: string;
  poster_alt?: string | null;
  poster_alt_bn?: string | null;
  start_date: string; // ISO date e.g. "2026-07-12"
  start_time: string; // "HH:MM" 24h
  end_date?: string | null;
  end_time?: string | null;
  city: string;
  sub_area: string;
  venue_name: string;
  venue_name_bn?: string | null;
  area_details: string;
  area_details_bn?: string | null;
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
  show_in_hero: boolean; // editorially promoted to homepage carousel
  status: EventStatus;
  expected_attendance?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  // Same fields as Event, but for un-reviewed submissions
  id: string;
  title: string;
  title_bn?: string | null;
  description: string;
  description_bn?: string | null;
  poster_url?: string | null;
  start_date: string;
  start_time: string;
  end_date?: string | null;
  end_time?: string | null;
  city: string;
  sub_area: string;
  venue_name: string;
  venue_name_bn?: string | null;
  area_details: string;
  area_details_bn?: string | null;
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
  date_preset?: "today" | "weekend" | "next7" | "next30"; // one-click date shortcuts
  weekend?: boolean;
  search?: string;
  featured?: boolean;
  price_type?: PriceType | "all";
  view?: "grid" | "list"; // display preference (client-only, persisted in URL)
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

// Submission review state — promoted to a named alias
export type ReviewStatus = "submitted" | "approved" | "rejected" | "needs_info";

// Analytics summary returned by /admin/analytics/summary — PRD §8.4 / FR-89..FR-94
export interface AnalyticsDailyPoint {
  date: string; // ISO date "YYYY-MM-DD"
  pageviews: number;
  outbound_clicks: number;
}

export interface AnalyticsTopEvent {
  id: string;
  title: string;
  slug: string;
  views: number;
  clicks: number;
}

export interface AnalyticsTopCategory {
  slug: string;
  name: string;
  share: number; // 0..1 share of total pageviews
}

export interface AnalyticsTopSubArea {
  name: string;
  views: number;
  share: number;
}

export interface AnalyticsTrafficSource {
  source: string; // utm_source or "(direct)"
  pageviews: number;
  outbound_clicks: number;
}

/** Funnel step counts — derived from event types */
export interface AnalyticsFunnel {
  visitors: number;
  event_views: number;
  outbound_clicks: number;
  form_completions: number;
}

/** Recent-activity row for the bottom of the dashboard */
export interface AnalyticsRecentEvent {
  ts: string;
  type: "page_view" | "outbound_click" | "form_completion";
  path?: string | null;
  event_id?: string | null;
  ref?: string | null;
}

export interface AdminAnalyticsSummary {
  range: "7d" | "30d";
  total_pageviews: number;
  total_outbound_clicks: number;
  unique_sessions: number;
  unique_events_viewed: number;
  conversion_rate: number; // 0..1
  daily: AnalyticsDailyPoint[];
  top_events_by_views: AnalyticsTopEvent[];
  top_events_by_clicks: AnalyticsTopEvent[];
  top_categories: AnalyticsTopCategory[];
  top_sub_areas: AnalyticsTopSubArea[];
  traffic_sources: AnalyticsTrafficSource[];
  funnel?: AnalyticsFunnel;
  recent?: AnalyticsRecentEvent[];
  form_completions: number; // FR-93
  email_signups: number; // FR-94
}

export interface EventAnalyticsDetail {
  event_id: string;
  title: string;
  slug: string;
  range: "7d" | "30d";
  total_pageviews: number;
  total_outbound_clicks: number;
  unique_sessions: number;
  conversion_rate: number;
  daily: AnalyticsDailyPoint[];
  traffic_sources: AnalyticsTrafficSource[];
  recent: AnalyticsRecentEvent[];
}

// Tracking pixels & raw scripts injected into the public site's <head>/<body>.
// Authored from /admin/settings, persisted to data/settings.json, and emitted
// by components/seo/injected-{head,body}.tsx on every public page render.
export type PixelProvider =
  | "facebook"
  | "google_analytics"
  | "tiktok"
  | "custom";

export interface PixelCode {
  id: string; // crypto.randomUUID() — stable React key + storage id
  provider: PixelProvider;
  // For known providers: the canonical ID (FB pixel ID, GA Measurement ID, TikTok pixel code).
  // For "custom": the literal <script>...</script> snippet the admin pasted.
  pixel_id: string;
  placement: "head" | "body";
  enabled: boolean;
  // Free-text admin note. Never rendered to the public site.
  notes?: string;
  created_at: string;
}

// Custom <meta> tags emitted into the public site's <head>. MVP: global scope only.
// Use cases: google-site-verification, theme-color, msapplication-TileColor,
// custom robots directives, anything the static `metadata` export can't express.
export interface MetaTag {
  id: string;
  name: string;
  content: string;
  enabled: boolean;
  created_at: string;
}

// Platform-level settings (admin /admin/settings) — singleton row persisted to
// data/settings.json via /api/settings. Server-rendered into public pages by
// components/seo/injected-{head,body}.tsx.
export interface AdminSettings {
  site_name: string;
  tagline: string;
  default_city: string;
  default_outbound_label: OutboundButtonLabel;
  outbound_labels: OutboundButtonLabel[];
  pixels: PixelCode[];
  meta_tags: MetaTag[];
  updated_at?: string;
}