"use client";

import Link from "next/link";
import { useState } from "react";
import { fallbackEvents } from "@/lib/fallback-data";
import { clsx } from "@/lib/util";

export function EventEditView({ slug }: { slug: string }) {
  const ev = fallbackEvents.find((e) => e.slug === slug) ?? fallbackEvents[0];
  const [tab, setTab] = useState<"details" | "schedule" | "outbound" | "notes">("details");
  const [featured, setFeatured] = useState(!!ev.is_featured);
  const [status, setStatus] = useState(ev.status);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Event · Edit</div>
          <h1 className="t-huge tracking-tighter">
            {ev.title.split(" ").slice(0, 3).join(" ").toUpperCase()}
            <span className="text-accent">.</span>
          </h1>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65 mt-2">
            REF / EV-{ev.id.toUpperCase()} · Last edited 2h ago · curator@cholojai.bd
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 flex flex-col md:items-end gap-2">
          <Link href={`/events/${ev.slug}`} className="btn-ghost">
            View listing <span aria-hidden>↗</span>
          </Link>
          <button className="btn-accent">✓ Save changes</button>
        </div>
      </header>

      <div className="flex items-center gap-px bg-ink border border-ink overflow-x-auto" role="tablist">
        {(["details", "schedule", "outbound", "notes"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={clsx(
              "h-10 px-4 font-mono uppercase tracking-[0.18em] text-[11px] border-r border-ink last:border-r-0 focus-ring",
              tab === k ? "bg-paper text-ink" : "bg-ink text-ivory hover:bg-paper/10"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 border border-ink bg-bone p-6 md:p-8">
          {tab === "details" && (
            <div className="space-y-5">
              <Field label="Title"><input className="input-brut" defaultValue={ev.title} /></Field>
              <Field label="Description"><textarea className="input-brut min-h-[160px]" defaultValue={ev.description} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Venue"><input className="input-brut" defaultValue={ev.venue_name} /></Field>
                <Field label="Sector"><input className="input-brut" defaultValue={ev.sub_area} /></Field>
                <Field label="Address"><input className="input-brut" defaultValue={ev.area_details} /></Field>
                <Field label="Maps link"><input className="input-brut" defaultValue={ev.maps_link ?? ""} /></Field>
              </div>
            </div>
          )}
          {tab === "schedule" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <Field label="Start date"><input type="date" className="input-brut" defaultValue={ev.start_date} /></Field>
                <Field label="Start time"><input type="time" className="input-brut" defaultValue={ev.start_time} /></Field>
                <Field label="End date"><input type="date" className="input-brut" defaultValue={ev.end_date ?? ""} /></Field>
                <Field label="End time"><input type="time" className="input-brut" defaultValue={ev.end_time ?? ""} /></Field>
              </div>
            </div>
          )}
          {tab === "outbound" && (
            <div className="space-y-5">
              <Field label="Outbound URL"><input className="input-brut" defaultValue={ev.outbound_link} /></Field>
              <Field label="Button label">
                <select className="input-brut" defaultValue={ev.outbound_button_label}>
                  {["Register", "Get Tickets", "Learn More", "Contact Organizer", "View Official Page"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <div className="border border-accent bg-paper p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent mb-2">▸ Source link (internal)</div>
                <input className="input-brut" placeholder="https://instagram.com/p/..." />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-2">Not displayed publicly.</p>
              </div>
            </div>
          )}
          {tab === "notes" && (
            <Field label="Internal notes">
              <textarea className="input-brut min-h-[180px]" placeholder="Anything the next admin should know." />
            </Field>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="border border-ink bg-bone p-5">
            <div className="eyebrow !text-accent mb-3">Status</div>
            <label htmlFor="admin-status" className="sr-only">Status</label>
            <select id="admin-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input-brut mb-4">
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 border border-ink accent-accent"
              />
              <span className="font-mono text-[12px] uppercase tracking-[0.16em]">★ Featured</span>
            </label>
          </div>

          <div className="border border-ink bg-paper p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ev.poster_url} alt="" className="w-full h-auto poster-treat" />
            <button className="btn-ghost w-full mt-3">↥ Replace poster</button>
          </div>

          <div className="border border-accent bg-paper p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">Danger zone</div>
            <button className="btn-ghost w-full !border-accent text-accent hover:!bg-accent hover:!text-ivory">
              Delete listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-brut mb-2 block">{label}</label>
      {children}
    </div>
  );
}