"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { categoryBySlug, tagBySlug, formatDate, formatTime, clsx } from "@/lib/util";
import { EventCard, OutboundButton } from "@/components/EventCard";
import { trackPageview } from "@/lib/api";

export function EventDetail({ ev, related }: { ev: EventItem; related: EventItem[] }) {
  useEffect(() => {
    trackPageview(`/events/${ev.slug}`, ev.id);
  }, [ev.id, ev.slug]);

  const d = new Date(ev.start_date);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const mon = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const wknd = d.getDay() === 5 || d.getDay() === 6 || d.getDay() === 0;

  return (
    <article className="bg-paper">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-ink/15">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
          <Link href="/" className="hover:text-accent">Cholo Jai</Link>
          <span className="opacity-40">/</span>
          <Link href="/events" className="hover:text-accent">Index</Link>
          <span className="opacity-40">/</span>
          <span className="text-ink truncate">{ev.title}</span>
        </div>
      </nav>

      {/* Hero — asymmetric editorial */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-10 md:py-16 grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
                {ev.city} / {ev.sub_area}
              </span>
              <span aria-hidden className="opacity-40">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                {ev.status}
              </span>
            </div>

            <h1 className="font-display text-huge md:text-mega tracking-tighter leading-[0.85] mb-6">
              {ev.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {ev.categories.map((s) => {
                const c = categoryBySlug(s);
                return c ? <span key={s} className="chip">{c.name}</span> : null;
              })}
              {ev.audience_tags?.map((s) => {
                const t = tagBySlug(s);
                return t ? <span key={s} className="chip-ink">{t.name}</span> : null;
              })}
              {ev.is_featured && <span className="chip-accent">★ Featured</span>}
            </div>

            {/* CTA */}
            <div className="border border-ink p-5 md:p-6 bg-bone">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">
                ▸ Primary action
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <OutboundButton ev={ev} className="flex-1" />
                {ev.maps_link && (
                  <a
                    href={ev.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost flex-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    Open in Maps
                  </a>
                )}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60 truncate">
                → {ev.outbound_link}
              </div>
            </div>
          </div>

          {/* Poster */}
          <div className="col-span-12 lg:col-span-5 order-1 lg:order-2">
            <div className="relative border border-ink overflow-hidden bg-ink aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ev.poster_url}
                alt={ev.title}
                className="absolute inset-0 w-full h-full object-cover poster-treat"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                {ev.is_featured && <span className="chip-accent">★ Featured</span>}
                <span className={clsx("chip", ev.price_type === "free" ? "chip-accent" : "chip-ink !bg-ink !text-ivory")}>
                  {ev.price_type === "free" ? "● Free entry" : `◐ ${ev.price_note ?? "Paid"}`}
                </span>
                {wknd && <span className="chip-ink !bg-ink !text-ivory">Weekend</span>}
              </div>
              <div className="absolute bottom-4 right-4 bg-paper px-3 py-2.5 border border-ink text-ink text-center leading-none">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-70">{mon}</div>
                <div className="font-display text-5xl mt-0.5">{day}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spec table — 4-col editorial data grid */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-10 md:py-14">
          <div className="field-grid">
            <Cell label="Date">
              <div className="font-display text-2xl tracking-tight">{formatDate(ev.start_date)}</div>
            </Cell>
            <Cell label="Time">
              <div className="font-display text-2xl tracking-tight">
                {formatTime(ev.start_time)}
                {ev.end_time ? <span className="text-ink/50"> → {formatTime(ev.end_time)}</span> : null}
              </div>
            </Cell>
            <Cell label="Venue">
              <div className="font-display text-xl tracking-tight leading-tight">{ev.venue_name}</div>
              <div className="text-ink/70 text-[13px] mt-1">{ev.area_details}</div>
            </Cell>
            <Cell label="Organizer">
              <div className="font-display text-xl tracking-tight">{ev.organizer_name}</div>
              {ev.organizer_social_link && (
                <a
                  href={ev.organizer_social_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent link-accent mt-1 inline-block"
                >
                  Social →
                </a>
              )}
            </Cell>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="border-b border-ink">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-14 md:py-20 grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-3">
            <div className="eyebrow mb-3">Section 01 — Brief</div>
            <h2 className="font-display text-big tracking-tighter leading-[0.95]">
              About this<br />
              <span className="font-serif italic text-accent">listing.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-9">
            <div className="prose-editorial">
              <p>{ev.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      {(ev.organizer_phone || ev.organizer_email) && (
        <section className="border-b border-ink bg-bone">
          <div className="mx-auto max-w-ed px-5 md:px-8 py-14 md:py-20 grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 md:col-span-3">
              <div className="eyebrow mb-3">Section 02 — Contact</div>
              <h2 className="font-display text-big tracking-tighter leading-[0.95]">
                Reach out,<br />
                <span className="font-serif italic text-accent">directly.</span>
              </h2>
              <p className="text-ink/70 text-sm mt-3 font-serif">
                Organizer details are never shared with third parties. Use them
                only for legitimate event inquiries.
              </p>
            </div>
            <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-px bg-ink border border-ink">
              {ev.organizer_phone && (
                <div className="bg-paper p-5 md:p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">▸ Phone</div>
                  <div className="font-display text-xl tracking-tight">{ev.organizer_phone}</div>
                </div>
              )}
              {ev.organizer_email && (
                <div className="bg-paper p-5 md:p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">▸ Email</div>
                  <a href={`mailto:${ev.organizer_email}`} className="font-display text-xl tracking-tight link-accent">
                    {ev.organizer_email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-ed px-5 md:px-8 py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="eyebrow mb-3">Also on the index</div>
              <h2 className="t-huge">
                More like<br />
                <span className="font-serif italic text-accent">this.</span>
              </h2>
            </div>
            <Link href="/events" className="btn-ghost">
              See the full index <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => <EventCard key={r.id} ev={r} />)}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-14 md:py-20 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <div className="eyebrow !text-ivory before:bg-accent mb-3">Reminder</div>
            <h2 className="t-huge">
              Wash your face.<br />
              <span className="font-serif italic text-accent">Go do this thing.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <OutboundButton ev={ev} className="w-full md:w-auto" />
          </div>
        </div>
        <div className="hazard-stripes h-2" aria-hidden />
      </section>
    </article>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="cell">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">▸ {label}</div>
      {children}
    </div>
  );
}