"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatEventDate, formatPrice } from "@/lib/utils";
import type { Event } from "@/lib/types";

interface HeroCarouselProps {
  events: Event[];
  autoRotateMs?: number;
}

// Auto-rotating, accessible carousel. Slide changes are announced via aria-live.
// Respects prefers-reduced-motion (no auto-rotation). Keyboard: ←/→ and Home/End.
export function HeroCarousel({ events, autoRotateMs = 6000 }: HeroCarouselProps) {
  const [index, setIndex] = React.useState(0);
  // Hovered is for desktop pointer (mouse hover). TouchInteraction is a sticky flag
  // set after any horizontal swipe so auto-rotation doesn't resume mid-touch.
  const [hovered, setHovered] = React.useState(false);
  const [touchedRecently, setTouchedRecently] = React.useState(false);
  const count = events.length;

  const go = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  // Auto-rotation. Uses setTimeout so each pause/resume restarts cleanly
  // (no race where the interval keeps firing after pause).
  const reduceMotion = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    reduceMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  React.useEffect(() => {
    if (count <= 1) return;
    if (hovered || touchedRecently || reduceMotion.current) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, autoRotateMs);
    return () => clearTimeout(id);
  }, [count, hovered, touchedRecently, autoRotateMs, index]);

  // Auto-clear the touch flag 1.5s after the last touch — so a swipe pauses
  // rotation for ~1.5s, then it resumes on its own.
  React.useEffect(() => {
    if (!touchedRecently) return;
    const id = setTimeout(() => setTouchedRecently(false), 1500);
    return () => clearTimeout(id);
  }, [touchedRecently]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(count - 1);
    }
  }

  if (count === 0) return null;

  // Touch swipe — horizontal pan to advance / retreat slides.
  const touchStartX = React.useRef<number | null>(null);
  const touchDeltaX = React.useRef(0);
  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null || e.touches.length !== 1) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }
  function onTouchEnd() {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    // 60px swipe threshold — comfortable without false positives.
    if (Math.abs(dx) >= 60) {
      go(dx < 0 ? index + 1 : index - 1);
      // Pause auto-rotation briefly so the user can read the new slide.
      setTouchedRecently(true);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      className="relative border-b border-rule bg-cream-50 overflow-hidden touch-pan-y"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative"
        tabIndex={0}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}: ${events[index].title}`}
        onKeyDown={onKeyDown}
      >
        {/* Slides stack — generous aspect so content reads cleanly on every breakpoint */}
        <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[16/7] xl:aspect-[16/6]">
          {events.map((e, i) => (
            <Slide
              key={e.id}
              event={e}
              active={i === index}
              position={i}
              total={count}
              ariaHidden={i !== index}
            />
          ))}
        </div>

        {/* Side controls — desktop only. Mobile relies on swipe + dots. */}
        <div className="hidden md:block">
          <CarouselButton
            direction="prev"
            onClick={() => go(index - 1)}
            label="Previous slide"
          />
          <CarouselButton
            direction="next"
            onClick={() => go(index + 1)}
            label="Next slide"
          />
        </div>

        {/* Bottom: dots + meta */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-4 p-4 sm:p-6 md:p-8 pointer-events-none">
          <ol
            role="tablist"
            aria-label="Choose slide"
            className="pointer-events-auto flex items-center gap-1.5"
          >
            {events.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${e.title}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-8 bg-paper"
                      : "w-3 bg-paper/40 hover:bg-paper/70",
                  )}
                />
              </li>
            ))}
          </ol>
          <p
            aria-live="polite"
            className="hidden md:block pointer-events-none text-[0.65rem] font-mono uppercase tracking-[0.18em] text-paper/80"
          >
            <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span className="opacity-50"> / </span>
            <span className="tabular-nums">{String(count).padStart(2, "0")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Slide({
  event,
  active,
  position,
  total,
  ariaHidden,
}: {
  event: Event;
  active: boolean;
  position: number;
  total: number;
  ariaHidden: boolean;
}) {
  const isFree = event.price_type === "free";
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-out",
        active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
      )}
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${total}`}
      aria-hidden={ariaHidden}
    >
      {/* Backdrop image */}
      <Image
        src={event.poster_url}
        alt=""
        fill
        sizes="100vw"
        priority={position === 0}
        className="object-cover"
      />
      {/* Gradient overlay — deep on the left (content), fades to a hint of poster on the right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 via-55% to-ink/40 md:from-ink/95 md:via-ink/70 md:to-ink/30"
        aria-hidden
      />
      {/* Bottom dimmer on small screens — keeps white text legible on mobile */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/70 to-transparent md:hidden"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        <div className="editorial-container flex h-full flex-col">
          {/* Mobile-only: dot indicator at top to reinforce slide position */}
          <div className="flex items-center gap-2 pt-5 md:hidden">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/70">
              <span className="tabular-nums">{String(position + 1).padStart(2, "0")}</span>
              <span className="opacity-50"> / </span>
              <span className="tabular-nums">{String(total).padStart(2, "0")}</span>
            </span>
            <span className="h-px flex-1 bg-paper/20" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/70">
              Worth your time
            </span>
          </div>

          <div className="flex flex-1 items-end pb-24 pt-6 sm:pb-24 sm:pt-10 md:items-center md:pb-20 md:pt-0 lg:pb-16">
            <div className="grid w-full gap-6 md:grid-cols-12 md:gap-10">
              {/* Primary content — spans 7 cols on desktop; full width on mobile/tablet */}
              <div className="md:col-span-7 text-paper">
                {/* Editorial eyebrow + badges — desktop only inline, mobile above title */}
                <div className="hidden md:flex items-center gap-2">
                  <Badge className="bg-paper/15 text-paper backdrop-blur-sm border-paper/20 font-mono uppercase tracking-wider">
                    Worth your time
                  </Badge>
                  {isFree && (
                    <Badge variant="outline" className="border-paper/40 bg-paper/10 text-paper backdrop-blur-sm">
                      Free
                    </Badge>
                  )}
                </div>

                <h2 className="mt-3 font-display text-[1.6rem] leading-[1.05] tracking-tight text-balance sm:mt-0 sm:text-4xl md:mt-5 md:text-5xl lg:text-6xl">
                  {event.title}
                </h2>

                {/* Description — mobile clamps to 2 lines to preserve aspect budget;
                    desktop expands to 3 lines. */}
                <p className="mt-3 hidden max-w-xl font-display text-base leading-relaxed text-paper/85 sm:block sm:text-lg sm:line-clamp-3">
                  {event.description}
                </p>

                {/* Meta — always stacked cleanly. 3 rows on mobile (full labels),
                    3 cols on sm+ with icons only (label is in sr-only). */}
                <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:mt-7 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-paper/85">
                    <Calendar className="h-4 w-4 shrink-0 text-paper/60" aria-hidden />
                    <dt className="sr-only sm:not-sr-only sm:text-paper/60 sm:text-[0.7rem] sm:font-mono sm:uppercase sm:tracking-wider sm:mr-1">When</dt>
                    <dd className="line-clamp-1">{formatEventDate(event.start_date, event.start_time)}</dd>
                  </div>
                  <div className="flex items-center gap-2 text-paper/85">
                    <MapPin className="h-4 w-4 shrink-0 text-paper/60" aria-hidden />
                    <dt className="sr-only sm:not-sr-only sm:text-paper/60 sm:text-[0.7rem] sm:font-mono sm:uppercase sm:tracking-wider sm:mr-1">Where</dt>
                    <dd className="line-clamp-1">
                      <span className="sm:hidden">{event.sub_area}</span>
                      <span className="hidden sm:inline">{event.venue_name}, {event.sub_area}</span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-paper/85">
                    <dt className="sr-only sm:not-sr-only sm:text-paper/60 sm:text-[0.7rem] sm:font-mono sm:uppercase sm:tracking-wider sm:mr-1">Cost</dt>
                    <dd className="font-mono uppercase tracking-wider">
                      {formatPrice(event.price_type, event.price_note)}
                    </dd>
                  </div>
                </dl>

                {/* CTAs — stack on narrow widths, side-by-side on sm+ */}
                <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
                  <Button asChild size="lg" className="w-full bg-orange-500 text-white hover:bg-orange-600 sm:w-auto">
                    <Link href={`/events/${event.slug}`}>
                      Tell me more
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="w-full border border-paper/30 text-paper hover:bg-paper/10 hover:text-paper sm:w-auto"
                  >
                    <Link href={`/events/${event.slug}#register`}>
                      {event.outbound_button_label}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Desktop-only secondary panel — balances the right-side empty space,
                  gives readers a "at-a-glance" summary card. Hidden on mobile to
                  preserve the full-bleed image. */}
              <aside className="hidden md:col-span-5 md:flex md:items-center md:justify-end">
                <div className="w-full max-w-sm space-y-3 rounded-xl border border-paper/15 bg-paper/10 p-5 backdrop-blur-md">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper/60">
                    This week&rsquo;s pick
                  </p>
                  <p className="font-display text-xl leading-snug text-paper text-balance">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-paper/80">
                    <Calendar className="h-3.5 w-3.5 text-paper/60" />
                    <time dateTime={event.start_date}>{formatEventDate(event.start_date, event.start_time)}</time>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-paper/80">
                    <MapPin className="h-3.5 w-3.5 text-paper/60" />
                    <span className="line-clamp-1">{event.venue_name}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-paper/15">
                    <p className="text-xs text-paper/70">
                      Curated by the editorial desk. Updated weekly.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-30 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/70",
        direction === "prev" ? "left-3 sm:left-5" : "right-3 sm:right-5",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
