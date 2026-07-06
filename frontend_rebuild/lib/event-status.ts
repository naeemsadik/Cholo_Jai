// Shared helpers for EventStatus / ReviewStatus presentation and transitions.
// Used by admin events dashboard, admin event edit, admin submission review,
// and the admin-only status pill on the public event detail page.

import type { EventStatus, ReviewStatus } from "./types";

export const STATUS_LABEL: Record<EventStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  published: "Published",
  unpublished: "Unpublished",
  archived: "Archived",
  rejected: "Rejected",
};

export type StatusTone = "muted" | "accent" | "ember" | "ink" | "outline";

export const STATUS_TONE: Record<EventStatus, StatusTone> = {
  draft: "muted",
  submitted: "outline",
  published: "accent",
  unpublished: "ember",
  archived: "muted",
  rejected: "ember",
};

// Allowed status transitions for the admin status dropdown.
// Order matters: the first item is treated as the default next state.
export const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["published", "submitted", "rejected", "archived"],
  submitted: ["published", "rejected", "needs_info" as EventStatus, "archived"].filter(
    (s) => s !== ("needs_info" as EventStatus),
  ) as EventStatus[],
  published: ["unpublished", "archived"],
  unpublished: ["published", "archived"],
  archived: ["draft", "published"],
  rejected: ["draft", "archived"],
};

export const ALL_EVENT_STATUSES: EventStatus[] = [
  "draft",
  "submitted",
  "published",
  "unpublished",
  "archived",
  "rejected",
];

// ── Review status (submissions) ────────────────────────────────────────────

export const REVIEW_LABEL: Record<ReviewStatus, string> = {
  submitted: "New",
  approved: "Approved",
  rejected: "Rejected",
  needs_info: "Needs info",
};

export const REVIEW_TONE: Record<ReviewStatus, StatusTone> = {
  submitted: "outline",
  approved: "accent",
  rejected: "ember",
  needs_info: "muted",
};

export const ALL_REVIEW_STATUSES: ReviewStatus[] = [
  "submitted",
  "approved",
  "rejected",
  "needs_info",
];