"use client";

import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { categoryBySlug, formatTime, clsx } from "@/lib/util";
import { trackOutboundClick } from "@/lib/api";

interface CardProps {
  ev: EventItem;
  variant?: "default" | "feature" | "wide" | "compact";
  index?: number;
}

export function EventCard({ ev, variant = "default", index }: CardProps) {
  const d = new Date(ev.start_date);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const wknd = d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0;

  return (
    <Link
      href={`/events/${ev.slug}`}
      className={clsx(
        "card group block overflow-hidden bg-bone focus-ring",
        variant === "feature" && "h-full",
        variant === "wide" && "h-full"
      )}
      aria-label={`${ev.title} — ${ev.sub_area}`}
    >
      <div className="relative">
        {/* Poster */}
        <div
          className={clsx(
            "relative overflow-hidden bg-ink",
            variant === "feature"
              ? "aspect-[4/5]"
              : variant === "wide"
              ? "aspect-[16/9]"
              : variant === "compact"
              ? "aspect-[5/3]"
              : "aspect-[4/3]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ev.poster_url}
            alt={ev.title}
            loading="lazy"
            className="w-full h-full object-cover poster-treat transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {/* Index marker */}
          {typeof index === "number" && (
            <div className="absolute top-0 left-0 bg-ink/95 text-ivory font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent" aria-hidden />
              {String(index + 1).padStart(2, "0")}
            </div>
          )}

          {/* Date block */}
          <div className="absolute top-0 right-0 bg-paper text-ink font-display text-center leading-none px-3 py-2.5 border-l border-b border-ink">
            <div className="text-[9px] uppercase tracking-[0.2em] font-mono opacity-70">
              {mon}
            </div>
            <div className="text-3xl mt-0.5">{day}</div>
          </div>

          {/* Price / weekend chip */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {ev.price_type === "free" ? (
              <span className="chip-accent">● Free</span>
            ) : (
              <span className="chip-ink">◐ {ev.price_note ?? "Paid"}</span>
            )}
            {wknd && (
              <span className="chip">Weekend</span>
            )}
            {ev.is_featured && (
              <span className="chip-accent">★ Featured</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 border-t border-ink">
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65 truncate">
              {ev.sub_area} · {ev.city}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent font-semibold flex-shrink-0">
              {formatTime(ev.start_time)}
            </span>
          </div>

          <h3
            className={clsx(
              "font-display tracking-tighter leading-[0.95] mb-4 group-hover:text-accent transition-colors",
              variant === "feature" ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
            )}
          >
            {ev.title}
          </h3>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {ev.categories.slice(0, 3).map((s) => {
              const c = categoryBySlug(s);
              return c ? <span key={s} className="chip">{c.name}</span> : null;
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-ink/15 text-[11px] font-mono uppercase tracking-[0.16em]">
            <span className="text-ink/65 truncate max-w-[60%]">{ev.venue_name}</span>
            <span className="text-ink flex items-center gap-1.5 group-hover:text-accent transition-colors">
              Read
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OutboundButton({
  ev,
  className,
}: {
  ev: EventItem;
  className?: string;
}) {
  return (
    <a
      href={ev.outbound_link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackOutboundClick(ev.id, ev.outbound_button_label, ev.outbound_link)}
      className={clsx("btn-accent w-full sm:w-auto", className)}
    >
      {ev.outbound_button_label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}