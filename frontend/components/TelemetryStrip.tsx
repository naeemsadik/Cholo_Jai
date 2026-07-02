"use client";

export function TelemetryStrip({ total, free, weekend }: { total: number; free: number; weekend: number }) {
  return (
    <div className="border-y-2 border-ink bg-bone">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-ink">
        <Stat label="ACTIVE LISTINGS" value={String(total).padStart(2, "0")} hint="PUBLISHED & UPCOMING" />
        <Stat label="FREE ENTRY" value={String(free).padStart(2, "0")} hint="DONATION-BASED OMITTED" hazard />
        <Stat label="WEEKEND EVENTS" value={String(weekend).padStart(2, "0")} hint="FRI / SAT / SUN ONLY" />
        <Stat label="LAST UPDATE" value="09:00" hint="REFRESHED DAILY · BD TIME" />
      </div>
    </div>
  );
}

function Stat({ label, value, hint, hazard }: { label: string; value: string; hint: string; hazard?: boolean }) {
  return (
    <div className="p-5 md:p-7 border-y-2 md:border-y-0 border-ink first:border-y-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70 mb-2">
        ▶ {label}
      </div>
      <div className={`font-display massive tracking-tight kern-tight leading-[0.85] ${hazard ? "text-hazard" : "text-ink"}`}>
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60 mt-2">
        {hint}
      </div>
    </div>
  );
}