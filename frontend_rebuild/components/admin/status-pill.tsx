"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, REVIEW_LABEL, type StatusTone } from "@/lib/event-status";
import type { EventStatus, ReviewStatus } from "@/lib/types";

const TONE_TO_BADGE: Record<StatusTone, "default" | "outline" | "accent" | "ember" | "ink" | "muted"> = {
  muted: "muted",
  outline: "outline",
  accent: "accent",
  ember: "ember",
  ink: "ink",
};

interface StatusPillProps {
  status: EventStatus;
  featured?: boolean;
  className?: string;
}

export function StatusPill({ status, featured, className }: StatusPillProps) {
  return (
    <Badge variant={TONE_TO_BADGE[eventStatusTone(status)]} className={cn("font-mono", className)}>
      {featured && <span className="mr-1 inline-block h-1 w-1 rounded-full bg-current" />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

interface ReviewPillProps {
  review_status: ReviewStatus;
  className?: string;
}

export function ReviewPill({ review_status, className }: ReviewPillProps) {
  return (
    <Badge variant={TONE_TO_BADGE[reviewStatusTone(review_status)]} className={cn("font-mono", className)}>
      {REVIEW_LABEL[review_status]}
    </Badge>
  );
}

// Tone lookups kept in this file so the component owns its presentation; the
// shared STATUS_TONE/REVIEW_TONE in lib/event-status.ts remains a single
// source of truth for non-presentation logic.
import { STATUS_TONE, REVIEW_TONE } from "@/lib/event-status";
function eventStatusTone(s: EventStatus): StatusTone {
  return STATUS_TONE[s];
}
function reviewStatusTone(s: ReviewStatus): StatusTone {
  return REVIEW_TONE[s];
}