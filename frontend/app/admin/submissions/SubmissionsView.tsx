"use client";

import { useState } from "react";
import { fallbackEvents } from "@/lib/fallback-data";
import { dayMonth, clsx } from "@/lib/util";

interface PendingRow {
  ref: string;
  title: string;
  org: string;
  sector: string;
  date: string;
  submitted: string;
}

const seedRows: PendingRow[] = fallbackEvents.slice(0, 7).map((e, i) => ({
  ref: `SUB-${(i + 1).toString().padStart(3, "0")}`,
  title: e.title,
  org: e.organizer_name,
  sector: e.sub_area,
  date: `${dayMonth(e.start_date).day} ${dayMonth(e.start_date).mon}`,
  submitted: ["3 HOURS AGO", "YESTERDAY", "2 DAYS AGO", "3 DAYS AGO", "5 DAYS AGO", "WEEK 12", "WEEK 11"][i],
}));

export function SubmissionsView() {
  const [filter, setFilter] = useState<"all" | "new" | "approved" | "rejected" | "info">("all");

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Submissions</div>
          <h1 className="t-huge tracking-tighter">
            Review<br />
            <span className="font-serif italic text-accent">queue.</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink border border-ink">
        <Card label="New" v="7" hint="needs triage" />
        <Card label="Approved" v="34" hint="this week" />
        <Card label="Rejected" v="9" hint="this week" />
        <Card label="Needs info" v="4" hint="waiting on org" hazard />
        <Card label="Archived" v="188" hint="since launch" />
      </div>

      <div className="flex items-center gap-px bg-ink border border-ink overflow-x-auto" role="tablist">
        {(["all", "new", "approved", "rejected", "info"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={clsx(
              "h-10 px-4 font-mono uppercase tracking-[0.18em] text-[11px] border-r border-ink last:border-r-0 focus-ring",
              filter === k ? "bg-paper text-ink" : "bg-ink text-ivory hover:bg-paper/10"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="border border-ink">
        <table className="btable">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Title</th>
              <th>Organizer</th>
              <th>Sector</th>
              <th>Event date</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {seedRows.map((r, i) => (
              <tr key={r.ref + i}>
                <td className="font-display">{r.ref}</td>
                <td className="font-display">{r.title}</td>
                <td>{r.org}</td>
                <td>{r.sector}</td>
                <td>{r.date}</td>
                <td className="opacity-80">{r.submitted}</td>
                <td>
                  <button className="link-accent font-mono text-[10px] uppercase tracking-[0.18em]">Review →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-ink bg-bone p-6">
        <div className="eyebrow !text-accent mb-4">Review drawer · demo</div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8">
            <h3 className="font-display text-2xl tracking-tight mb-3">{seedRows[0].title}</h3>
            <div className="prose-editorial">
              <p>
                The submission looks legitimate — verified organizer, real venue,
                and the date falls on a weekend. Poster is high-resolution and on-brand.
                Recommend publishing with the default <strong>Register</strong> CTA.
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
            <button className="btn-accent w-full">✓ Approve & publish</button>
            <button className="btn-ghost w-full">▸ Request more info</button>
            <button className="btn-ghost w-full !border-accent text-accent">✕ Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, v, hint, hazard }: { label: string; v: string; hint: string; hazard?: boolean }) {
  return (
    <div className="p-5 bg-paper">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65">{label}</div>
      <div className={clsx("font-display huge tracking-tighter mt-1", hazard && "text-accent")}>{v}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-2">{hint}</div>
    </div>
  );
}