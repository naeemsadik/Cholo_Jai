"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem } from "@/lib/types";
import { clsx } from "@/lib/util";

export function HeroEditorial({
  lead,
  featured,
  totalUpcoming,
}: {
  lead?: EventItem;
  featured: EventItem[];
  totalUpcoming: number;
}) {
  const [now, setNow] = useState("");
  useEffect(() => {
    setNow(
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  }, []);

  return (
    <section className="relative bg-paper overflow-hidden">
      {/* Coordinate grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0E0E0C 1px, transparent 1px), linear-gradient(to bottom, #0E0E0C 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative mx-auto max-w-ed px-5 md:px-8 pt-12 md:pt-20 pb-12 md:pb-16">
        {/* Issue masthead */}
        <div className="grid grid-cols-12 gap-4 mb-10 md:mb-14">
          <div className="col-span-12 md:col-span-4 flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-accent pulse-dot" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink">
              Live · Dhaka, BD
            </span>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-center items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
            <span>Vol. 01 · Issue №07</span>
            <span className="opacity-40">·</span>
            <span>30-day pilot</span>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
            <span className="font-semibold text-ink">{now || "—"}</span> BD · {String(totalUpcoming).padStart(2, "0")} listings live
          </div>
        </div>

        {/* Editorial headline */}
        <div className="grid grid-cols-12 gap-6 md:gap-8 items-end">
          <h1 className="col-span-12 lg:col-span-10">
            <span className="t-mega block">Find events</span>
            <span className="t-serif-mega block text-accent">
              worth going to.
            </span>
          </h1>
          <div className="col-span-12 lg:col-span-2 hidden lg:flex justify-end">
            <span className="barcode w-24 h-32" aria-hidden />
          </div>
        </div>

        {/* Subhead + lead */}
        <div className="grid grid-cols-12 gap-6 md:gap-8 mt-10 md:mt-14">
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <p className="font-serif text-lg md:text-xl text-ink/85 leading-relaxed">
              A curated editorial index of Dhaka —{" "}
              <span className="italic text-accent">hand-edited daily</span> by people
              who&rsquo;d actually go to these things.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary">
                Browse the index
                <span aria-hidden>→</span>
              </Link>
              <Link href="/submit" className="btn-ghost">
                <span aria-hidden>＋</span> List your event
              </Link>
            </div>
          </div>

          {/* Lead card */}
          {lead && (
            <Link
              href={`/events/${lead.slug}`}
              className="col-span-12 md:col-span-7 lg:col-span-8 card bg-bone group overflow-hidden focus-ring"
            >
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-12 md:col-span-7 relative aspect-[16/10] overflow-hidden bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.poster_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover poster-treat transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="chip-accent">★ Lead</span>
                    {lead.price_type === "free" && (
                      <span className="chip-ink">● Free</span>
                    )}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-5 p-5 md:p-7 flex flex-col justify-between border-t md:border-t-0 md:border-l border-ink">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">
                      Today&rsquo;s lead · {lead.sub_area}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl tracking-tighter leading-[0.95] mb-4 group-hover:text-accent transition-colors">
                      {lead.title}
                    </h2>
                    <p className="font-serif text-[15px] leading-relaxed text-ink/80 line-clamp-3">
                      {lead.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-ink/15 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                    <span>{new Date(lead.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                    <span className="text-accent flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                      Read listing <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Featured strip — three small */}
        {featured.length > 0 && (
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-ink border border-ink">
            {featured.map((ev, i) => (
              <Link
                key={ev.id}
                href={`/events/${ev.slug}`}
                className="bg-paper hover:bg-bone transition-colors p-5 md:p-6 group focus-ring"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="ed-num">{String(i + 2).padStart(2, "0")}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">
                    {new Date(ev.start_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <h3 className="font-display text-lg md:text-xl tracking-tight leading-[0.95] group-hover:text-accent transition-colors">
                  {ev.title}
                </h3>
                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
                  <span className="text-ink/60">{ev.sub_area}</span>
                  <span className="text-ink/80 group-hover:text-accent transition-colors flex items-center gap-1">
                    Open
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom hazard accent */}
        <div className="mt-12 md:mt-16 flex items-center justify-between border-t border-ink pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent" aria-hidden />
            <span>Updated 09:00 BD</span>
          </div>
          <div className="hidden md:block">
            Curated, not exhaustive · No spam · Manual review
          </div>
          <div className="font-semibold text-ink">Issue 07</div>
        </div>
      </div>
    </section>
  );
}