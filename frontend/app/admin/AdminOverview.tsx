import Link from "next/link";
import { fallbackEvents } from "@/lib/fallback-data";
import { dayMonth, formatTime, clsx } from "@/lib/util";

export function AdminOverview() {
  const recent = fallbackEvents.slice(0, 5);
  return (
    <div className="p-6 md:p-10 space-y-10">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Overview</div>
          <h1 className="t-huge tracking-tighter">
            Control<br />
            <span className="font-serif italic text-accent">room.</span>
          </h1>
        </div>
        <div className="col-span-12 md:col-span-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65 md:text-right">
          Day 09 / 30<br />
          <span className="text-accent">●</span> Pilot active
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border border-ink">
        <Metric k="Live listings" v="48" hint="Updated 09:00" />
        <Metric k="Submissions" v="12" hint="Awaiting review" hazard />
        <Metric k="30d outbound" v="1,284" hint="Click-throughs" />
        <Metric k="30d pageviews" v="14,902" hint="Uniques not counted" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 border border-ink">
          <div className="bg-ink text-ivory px-4 py-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
            <span>▸ Pending submissions</span>
            <Link href="/admin/submissions" className="text-accent hover:underline">View all →</Link>
          </div>
          <table className="btable">
            <thead>
              <tr>
                <th>№</th>
                <th>Title</th>
                <th>Org</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((ev, i) => (
                <tr key={ev.id}>
                  <td className="font-display">{String(i + 1).padStart(2, "0")}</td>
                  <td className="font-display">{ev.title}</td>
                  <td>{ev.organizer_name}</td>
                  <td>{dayMonth(ev.start_date).day} {dayMonth(ev.start_date).mon}</td>
                  <td>
                    <span className="pill pill-accent"><span className="dot" />Pending</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-12 lg:col-span-5 border border-ink">
          <div className="bg-ink text-ivory px-4 py-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
            <span>▸ 7-day activity</span>
            <span className="text-accent">↑ 18%</span>
          </div>
          <div className="p-5">
            <SparkBar values={[20, 35, 30, 55, 42, 70, 90]} />
            <div className="mt-6 grid grid-cols-2 gap-px bg-ink border border-ink">
              <Small k="Top event" v="Iftar Bazaar" hint="Old Dhaka" />
              <Small k="Top sector" v="Dhanmondi" hint="38% click-share" />
              <Small k="Top CTA" v="Get Tickets" hint="4 of 12" />
              <Small k="Bounce" v="21.4%" hint="From IG direct" />
            </div>
          </div>
        </div>
      </div>

      <div className="border border-ink">
        <div className="bg-ink text-ivory px-4 py-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
          <span>▸ Recent published events</span>
          <Link href="/admin/events" className="text-accent hover:underline">Manage →</Link>
        </div>
        <table className="btable">
          <thead>
            <tr>
              <th>№</th>
              <th>Title</th>
              <th>Sector</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((ev, i) => (
              <tr key={ev.id}>
                <td className="font-display">{String(i + 1).padStart(2, "0")}</td>
                <td className="font-display">{ev.title}</td>
                <td>{ev.sub_area}</td>
                <td>{dayMonth(ev.start_date).day} {dayMonth(ev.start_date).mon}</td>
                <td>{formatTime(ev.start_time)}</td>
                <td>{ev.price_type.toUpperCase()}</td>
                <td>
                  <span className={clsx("pill", ev.is_featured ? "pill-live" : "pill-accent")}>
                    <span className="dot" />
                    {ev.is_featured ? "Featured" : "Published"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ k, v, hint, hazard }: { k: string; v: string; hint: string; hazard?: boolean }) {
  return (
    <div className="p-5 md:p-6 bg-paper">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65">{k}</div>
      <div className={clsx("font-display huge tracking-tighter mt-1", hazard && "text-accent")}>{v}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-2">{hint}</div>
    </div>
  );
}

function Small({ k, v, hint }: { k: string; v: string; hint: string }) {
  return (
    <div className="p-4 bg-paper">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65">{k}</div>
      <div className="font-display text-lg tracking-tight mt-1">{v}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55 mt-1">{hint}</div>
    </div>
  );
}

function SparkBar({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="grid grid-cols-7 gap-2 h-40" aria-hidden>
      {values.map((v, i) => (
        <div key={i} className="flex flex-col justify-end">
          <div className="bg-accent" style={{ height: `${(v / max) * 100}%` }} />
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/55 text-center mt-2">
            D-{7 - i}
          </div>
        </div>
      ))}
    </div>
  );
}