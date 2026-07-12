"use client";

import * as React from "react";
import { ArrowUpRight, CalendarPlus, Copy, MapPin, MoreVertical, Share2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/toaster";
import { MobileStickyBar } from "@/components/mobile/sticky-bar";
import { trackOutboundClick } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Event } from "@/lib/types";

interface EventMobileActionsProps {
  event: Event;
}

// Mobile-only sticky action bar + secondary actions sheet for event detail.
// Always visible <lg; the outbound CTA is the primary action.
export function EventMobileActions({ event }: EventMobileActionsProps) {
  const priceLabel = formatPrice(event.price_type, event.price_note);
  const eventPath = React.useMemo(() => `/events/${event.slug}`, [event.slug]);
  const [eventUrl, setEventUrl] = React.useState(eventPath);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setEventUrl(`${window.location.origin}${eventPath}`);
  }, [eventPath]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast({ title: "Link copied", description: "Paste it into a message or status.", variant: "success" });
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  }

  function onOutbound() {
    trackOutboundClick(event.id, event.outbound_button_label, event.outbound_link);
  }

  return (
    <MobileStickyBar
      meta={
        <span className="block leading-tight">
          <span className="block font-display text-sm font-semibold text-ink">{priceLabel}</span>
          <span className="block text-[0.6rem] text-ink-500">{event.venue_name}</span>
        </span>
      }
      primary={{
        label: event.outbound_button_label,
        href: event.outbound_link,
        onClick: onOutbound,
        icon: <ArrowUpRight className="h-4 w-4" />,
      }}
      secondarySlot={
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-rule bg-paper text-ink transition-colors hover:bg-cream-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="inset-x-0 bottom-0 rounded-t-2xl px-0 pb-[max(env(safe-area-inset-bottom,0px),1rem)]"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-rule" aria-hidden />
            <SheetHeader>
              <SheetTitle>Want to share it?</SheetTitle>
              <SheetDescription>Send it to a friend, save the date, or get directions.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2 px-4 pb-6">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${event.title} — ${eventUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-lg border border-rule bg-paper px-4 py-3 text-sm font-medium hover:bg-cream-50"
              >
                <Share2 className="h-4 w-4 text-ink-500" />
                Share on WhatsApp
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-3 rounded-lg border border-rule bg-paper px-4 py-3 text-sm font-medium hover:bg-cream-50"
              >
                <Copy className="h-4 w-4 text-ink-500" />
                Copy link
              </button>
              <a
                href={`/api/ics/${event.slug}`}
                download
                className="flex w-full items-center gap-3 rounded-lg border border-rule bg-paper px-4 py-3 text-sm font-medium hover:bg-cream-50"
              >
                <CalendarPlus className="h-4 w-4 text-ink-500" />
                Add to calendar (.ics)
              </a>
              {event.maps_link && (
                <a
                  href={event.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-lg border border-rule bg-paper px-4 py-3 text-sm font-medium hover:bg-cream-50"
                >
                  <MapPin className="h-4 w-4 text-ink-500" />
                  Open in Google Maps
                </a>
              )}
            </div>
          </SheetContent>
        </Sheet>
      }
    />
  );
}
