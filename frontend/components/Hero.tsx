"use client";

import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { dayMonth, formatTime, clsx } from "@/lib/util";

export function Hero({ featured }: { featured: EventItem[] }) {
  const lead = featured[0];
  return (
    <section className="relative bg-paper">
      {/* Coordinate grid backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <div className="h-full w-full" style={{
          backgroundImage: "linear-gradient(to right, #0B0B0B 1px, transparent 1px), linear-gradient(to bottom, #0B0B0B 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8 pt-10 md:pt-16 pb-10 md:pb-16">
        {/* Top metadata strip */}
        <div className="grid grid-cols-12 gap-4 mb-8 md:mb-12">
          <div className="col-span-12 md:col-span-3 flex items-center gap-2">
            <span className="dot dot-hazard" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
              ISSUE №{String(new Date().getMonth() + 1).padStart(2, "0")} · {new Date().getFullYear()}
            </span>
          </div>
          <div className="col-span-12 md:col-span-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
            <span>VOL. 01</span>
            <span className="opacity-50">/</span>
            <span>DHAKA CITY</span>
            <span className="opacity-50">/</span>
            <span>30-DAY PILOT</span>
            <span className="opacity-50">/</span>
            <span className="text-hazard font-bold">UPDATED 09:00 BD</span>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end font-mono text-[10px] uppercase tracking-[0.22em]">
            COVER · {featured[0]?.title.split(" ").slice(0, 2).join(" ").toUpperCase()}
          </div>
        </div>

        {/* Hero headline */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 items-end">
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display tracking-tight kern-tight leading-[0.84] text-ink">
              <span className="block text-[clamp(3.5rem,11vw,12rem)]">FIND</span>
              <span className="block text-[clamp(3.5rem,11vw,12rem)] text-hazard">EVENTS</span>
              <span className="block text-[clamp(3.5rem,11vw,12rem)] font-serif italic text-ink halftone px-2 inline-block">
                worth going to.
              </span>
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-3">
            <div className="border-2 border-ink p-5 bg-bone">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-hazard mb-3">
                ▣ THE PROMISE
              </div>
              <p className="font-serif text-[16px] leading-snug text-ink">
                A curated, hand-edited index of Dhaka — <strong>workshops</strong>,{" "}
                <strong>weekend runs</strong>, <strong>Iftar walks</strong>, gigs,
                exhibitions, talks. No spam, no sold-out fluff, no five-minute webinars.
              </p>
              <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-between">
                <Link href="/events" className="link-brut font-mono text-[11px] uppercase tracking-[0.18em]">
                  Browse index →
                </Link>
                <Link href="/submit" className="font-mono text-[11px] uppercase tracking-[0.18em] text-hazard font-bold">
                  + Submit
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: barcode + small action + featured lead card */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 mt-10 md:mt-16">
          <div className="col-span-12 md:col-span-4">
            <div className="border-2 border-ink bg-bone">
              <div className="bar-ink text-bone px-4 py-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em]">COVER STORY</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-hazard">▶ LIVE</span>
              </div>
              <div className="p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70 mb-2">
                  {lead?.sub_area.toUpperCase()} · {lead && dayMonth(lead.start_date).mon}
                </div>
                <h3 className="font-display text-2xl tracking-tight leading-[0.95]">
                  {lead?.title}
                </h3>
                <p className="font-serif text-[14px] leading-snug mt-3 text-ink/80 line-clamp-3">
                  {lead?.description}
                </p>
                <Link
                  href={`/events/${lead?.slug}`}
                  className="mt-4 inline-flex items-center gap-2 link-brut font-mono text-[11px] uppercase tracking-[0.18em]"
                >
                  Read listing →
                </Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-12 gap-4">
              {featured.slice(1, 4).map((ev, i) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="col-span-12 sm:col-span-6 md:col-span-4 card-brut group bg-bone"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ev.poster_url} alt={ev.title} className="absolute inset-0 w-full h-full object-cover photo-brut group-hover:scale-[1.05] transition-transform duration-700" />
                    <div className="absolute top-2 left-2 bg-ink text-bone font-mono text-[10px] px-2 py-1">
                      № 0{i + 2}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-paper text-ink font-display text-2xl px-2 py-0.5 leading-none">
                      {dayMonth(ev.start_date).day}
                    </div>
                  </div>
                  <div className="p-3 border-t-2 border-ink">
                    <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/60 mb-1">
                      {ev.sub_area.toUpperCase()} · {formatTime(ev.start_time)}
                    </div>
                    <div className="font-display text-base leading-tight tracking-tight line-clamp-2 group-hover:text-hazard transition-colors">
                      {ev.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom hazard strip */}
        <div className="mt-10 md:mt-14 stripes-hazard h-2.5" />
      </div>
    </section>
  );
}