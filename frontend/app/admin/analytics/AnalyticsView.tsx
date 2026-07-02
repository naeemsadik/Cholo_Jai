import { clsx } from "@/lib/util";

export function AnalyticsView() {
  const days = [12, 18, 26, 21, 38, 49, 42, 60, 75, 88, 70, 92, 110, 95, 120, 145, 130, 162];
  const sources = [
    { k: "Instagram", v: 62, hint: "Primary channel" },
    { k: "Direct", v: 18, hint: "Shared / typed URL" },
    { k: "Facebook", v: 9, hint: "Secondary" },
    { k: "Search", v: 7, hint: "Organic SEO" },
    { k: "Other", v: 4, hint: "Referrers" },
  ];
  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-ink">
        <div className="col-span-12 md:col-span-9">
          <div className="eyebrow mb-3">Analytics · 30-day window</div>
          <h1 className="t-huge tracking-tighter">
            <span className="font-serif italic text-accent">Signal.</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink border border-ink">
        <Big label="Pageviews" v="14,902" hint="30d" />
        <Big label="Outbound" v="1,284" hint="30d" />
        <Big label="CTR (event → out)" v="8.6%" hint="30d" hazard />
        <Big label="Submissions" v="34" hint="30d" />
      </div>

      <div className="border border-ink bg-bone p-6">
        <div className="flex items-end justify-between mb-5">
          <div className="eyebrow !text-accent">Pageviews · 18 days</div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">Peak · Day 17 · 162</div>
        </div>
        <div className="grid grid-cols-18 gap-1 h-44" style={{ gridTemplateColumns: "repeat(18, minmax(0,1fr))" }} aria-hidden>
          {days.map((d, i) => (
            <div key={i} className="flex flex-col justify-end">
              <div className="bg-accent" style={{ height: `${(d / 170) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 border border-ink bg-bone p-6">
          <div className="eyebrow !text-accent mb-4">Traffic sources</div>
          <div className="space-y-3">
            {sources.map((s) => (
              <div key={s.k}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em]">{s.k}</div>
                  <div className="font-display text-lg">{s.v}%</div>
                </div>
                <div className="h-2 bg-paper border border-ink">
                  <div className="h-full bg-accent transition-all" style={{ width: `${s.v}%` }} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55 mt-1">{s.hint}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 border border-ink">
          <table className="btable">
            <thead>
              <tr>
                <th>Top sector</th>
                <th>Clicks</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Dhanmondi", "318", "21%"],
                ["Gulshan", "276", "18%"],
                ["Hatirjheel", "210", "14%"],
                ["Banani", "184", "12%"],
                ["Old Dhaka", "126", "8%"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td className="font-display">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Big({ label, v, hint, hazard }: { label: string; v: string; hint: string; hazard?: boolean }) {
  return (
    <div className="p-5 md:p-6 bg-paper">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65">{label}</div>
      <div className={clsx("font-display huge tracking-tighter mt-1", hazard && "text-accent")}>{v}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-2">{hint}</div>
    </div>
  );
}