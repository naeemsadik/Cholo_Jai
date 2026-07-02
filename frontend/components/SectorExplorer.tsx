"use client";

import Link from "next/link";
import { useState } from "react";
import type { SubArea } from "@/lib/types";
import { clsx } from "@/lib/util";

export function SectorExplorer({ sectors }: { sectors: SubArea[] }) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <section className="bg-bone border-y border-ink">
      <div className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24">
        <header className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-4">Section 06 — Sectors</div>
            <h2 className="t-huge text-ink">
              Dhaka,<br />
              <span className="font-serif italic text-accent">neighborhood</span> by<br />
              neighborhood.
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 flex md:items-end">
            <p className="font-serif text-lg text-ink/75 max-w-md">
              Sixteen sub-areas, mapped and indexed. Hover to preview, click to
              see what&rsquo;s on this weekend near you.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 border border-ink">
          {sectors.map((s, i) => (
            <Link
              key={s.id}
              href={`/events?sub_area=${encodeURIComponent(s.name)}`}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              className={clsx(
                "relative border-r border-b border-ink last:border-r-0 p-5 md:p-6 tile overflow-hidden focus-ring",
                hover === s.id ? "bg-ink text-ivory" : "bg-paper text-ink"
              )}
            >
              <div className="flex flex-col h-full min-h-[110px]">
                <div className="flex items-center justify-between mb-auto font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">
                  <span>S-{String(i + 1).padStart(2, "0")}</span>
                  <span
                    aria-hidden
                    className={clsx(
                      "transition-transform",
                      hover === s.id ? "translate-x-1 text-accent" : "text-ink/40"
                    )}
                  >
                    →
                  </span>
                </div>
                <div className="mt-6">
                  <div className="font-display text-xl md:text-2xl leading-[0.95] tracking-tight">
                    {s.name}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
                    {s.city}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">
          <span>Sorted alphabetically · 16 sectors live</span>
          <span className="text-accent">Coverage expanding</span>
        </div>
      </div>
    </section>
  );
}