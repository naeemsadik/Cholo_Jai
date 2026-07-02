export type PriceType = "free" | "paid";

export type OutboundButtonLabel =
  | "Register"
  | "Get Tickets"
  | "Learn More"
  | "Contact Organizer"
  | "View Official Page";

export type EventStatus =
  | "draft"
  | "submitted"
  | "published"
  | "unpublished"
  | "archived"
  | "rejected";

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
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  poster_url: string;
  start_date: string; // ISO
  start_time: string; // HH:mm
  end_date?: string;
  end_time?: string;
  city: string;
  sub_area: string;
  venue_name: string;
  area_details: string;
  maps_link?: string;
  categories: string[]; // slugs
  audience_tags?: string[];
  price_type: PriceType;
  price_note?: string;
  organizer_name: string;
  organizer_phone?: string;
  organizer_email?: string;
  organizer_social_link?: string;
  outbound_link: string;
  outbound_button_label: OutboundButtonLabel;
  is_featured?: boolean;
  is_recommended?: boolean;
  status: EventStatus;
  expected_attendance?: number;
}

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
}