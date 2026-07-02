"use client";

import * as React from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { Event } from "@/lib/types";
import { trackOutboundClick } from "@/lib/api";

interface OutboundButtonProps {
  event: Pick<Event, "id" | "outbound_link" | "outbound_button_label">;
  priceType?: "free" | "paid";
  priceNote?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outbound" | "outline" | "primary";
  className?: string;
}

export function OutboundButton({
  event,
  priceType,
  priceNote,
  size = "lg",
  variant = "outbound",
  className,
}: OutboundButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    trackOutboundClick(event.id, event.outbound_button_label, event.outbound_link);
    e.currentTarget.setAttribute("data-clicked", "true");
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        asChild
        variant={variant}
        size={size}
        className={cn("group", className)}
      >
        <a
          href={event.outbound_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          aria-label={`${event.outbound_button_label} (opens in a new tab)`}
        >
          <span>{event.outbound_button_label}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
      {priceType && (
        <span className="text-xs text-ink-500 sm:ml-3">
          <span className="font-mono uppercase tracking-wider">{formatPrice(priceType, priceNote)}</span>
        </span>
      )}
    </div>
  );
}

// Variant for compact cards — just text-link outbound trigger
interface OutboundLinkProps {
  event: Pick<Event, "id" | "outbound_link" | "outbound_button_label">;
  className?: string;
}

export function OutboundLink({ event, className }: OutboundLinkProps) {
  return (
    <a
      href={event.outbound_link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackOutboundClick(event.id, event.outbound_button_label, event.outbound_link)}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-ember hover:text-ember-600 transition-colors",
        className,
      )}
    >
      <span>{event.outbound_button_label}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}