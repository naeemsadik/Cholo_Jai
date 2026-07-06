"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  MailCheck,
  FileCheck2,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGetAnalyticsSummary } from "@/lib/api";
import type { AdminAnalyticsSummary } from "@/lib/types";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import { Sparkline } from "./charts/Sparkline";
import { LineChart } from "./charts/LineChart";
import { Donut } from "./charts/Donut";
import { Funnel } from "./charts/Funnel";
import { formatEventDate, relativeTime } from "@/lib/utils";

type Range = "7d" | "30d";

const SOURCE_COLOR_CLASSES = [
  "stroke-ember-600",
  "stroke-accent-600",
  "stroke-sky-500",
  "stroke-ink",
  "stroke-cream-400",
];

const FUNNEL_COLOR_CLASSES = [
  "bg-ember-600",
  "bg-ember-500",
  "bg-accent-600",
  "bg-accent-500",
];

export function AnalyticsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") as Range) === "7d" ? "7d" : "30d";
  const [summary, setSummary] = React.useState<AdminAnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await adminGetAnalyticsSummary(range);
    setSummary(res.data);
    setLoading(false);
    if (res.error) setError(res.error);
  }, [range]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      await reload();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);

  function setRange(r: Range) {
    const next = new URLSearchParams(searchParams);
    next.set("range", r);
    router.replace(`/admin/analytics?${next.toString()}`);
  }

  const isEmpty = !loading && summary && summary.total_pageviews === 0 && summary.total_outbound_clicks === 0;

  return (
    <>
      <AdminSectionHeader
        eyebrow="Analytics"
        title="Traffic & engagement"
        description="Self-hosted analytics — pageviews, outbound clicks, and form completions land in data/analytics.ndjson and roll up here."
        actions={
          <div className="flex gap-2">
            <Button
              variant={range === "7d" ? "primary" : "outline"}
              size="sm"
              onClick={() => setRange("7d")}
            >
              Last 7 days
            </Button>
            <Button
              variant={range === "30d" ? "primary" : "outline"}
              size="sm"
              onClick={() => setRange("30d")}
            >
              Last 30 days
            </Button>
          </div>
        }
      />

      {loading || !summary ? (
        <AnalyticsSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {error && (
            <div className="mt-6 rounded-md border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-700">
              {error}
            </div>
          )}

          {/* Row 1 — KPI strip */}
          <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard
              icon={Eye}
              label="Pageviews"
              value={summary.total_pageviews.toLocaleString()}
              spark={summary.daily.map((d) => d.pageviews)}
            />
            <KpiCard
              icon={MousePointerClick}
              label="Outbound clicks"
              value={summary.total_outbound_clicks.toLocaleString()}
              spark={summary.daily.map((d) => d.outbound_clicks)}
              sparkClass="stroke-accent-600"
            />
            <KpiCard
              icon={TrendingUp}
              label="Conversion"
              value={`${(summary.conversion_rate * 100).toFixed(1)}%`}
              sub="Click-through rate"
            />
            <KpiCard
              icon={Users}
              label="Sessions"
              value={summary.unique_sessions.toLocaleString()}
              sub="Unique browser tabs"
            />
          </section>

          {/* Row 2 — Time-series */}
          <section className="mt-6 rounded-lg border border-rule bg-paper p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="eyebrow">Pageviews vs outbound clicks</span>
                <h2 className="mt-2 font-display text-xl tracking-tight">
                  {range === "7d" ? "Last 7 days" : "Last 30 days"}
                </h2>
              </div>
              <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
                {summary.daily[0]?.date} → {summary.daily[summary.daily.length - 1]?.date}
              </span>
            </div>
            <div className="mt-6">
              <LineChart data={summary.daily} />
            </div>
          </section>

          {/* Row 3 — Funnel + Sources */}
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border border-rule bg-paper p-6">
              <span className="eyebrow">Funnel</span>
              <h2 className="mt-2 font-display text-xl tracking-tight">
                How visitors move through the site
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Unique sessions → event pageviews → outbound clicks → form completions.
              </p>
              <div className="mt-6">
                <Funnel
                  steps={[
                    {
                      label: "Visitors (sessions)",
                      value: summary.funnel?.visitors ?? summary.unique_sessions,
                      barClass: FUNNEL_COLOR_CLASSES[0],
                    },
                    {
                      label: "Event pageviews",
                      value: summary.funnel?.event_views ?? 0,
                      barClass: FUNNEL_COLOR_CLASSES[1],
                    },
                    {
                      label: "Outbound clicks",
                      value: summary.funnel?.outbound_clicks ?? summary.total_outbound_clicks,
                      barClass: FUNNEL_COLOR_CLASSES[2],
                    },
                    {
                      label: "Form completions",
                      value: summary.funnel?.form_completions ?? summary.form_completions,
                      barClass: FUNNEL_COLOR_CLASSES[3],
                    },
                  ]}
                />
              </div>
            </div>
            <div className="rounded-lg border border-rule bg-paper p-6">
              <span className="eyebrow">Traffic sources</span>
              <h2 className="mt-2 font-display text-xl tracking-tight">Where visitors come from</h2>
              <div className="mt-6">
                <Donut
                  slices={(summary.traffic_sources ?? []).slice(0, 5).map((s, i) => ({
                    label: prettySource(s.source),
                    value: s.pageviews,
                    colorClass: SOURCE_COLOR_CLASSES[i % SOURCE_COLOR_CLASSES.length],
                  }))}
                  centerValue={(summary.traffic_sources ?? []).reduce((s, x) => s + x.pageviews, 0).toLocaleString()}
                  centerLabel="Pageviews"
                />
              </div>
            </div>
          </section>

          {/* Row 4 — Top tables (3 columns) */}
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <TopCard
              eyebrow="Top events · views"
              title="What people are reading"
              href={`/admin/events`}
              rows={(summary.top_events_by_views ?? []).map((e) => ({
                key: e.id,
                title: e.title,
                href: `/events/${e.slug}`,
                value: e.views,
              }))}
              emptyText="No event views yet."
              colorClass="bg-ember-600"
            />
            <TopCard
              eyebrow="Top events · clicks"
              title="What people are clicking through"
              href={`/admin/events`}
              rows={(summary.top_events_by_clicks ?? []).map((e) => ({
                key: e.id,
                title: e.title,
                href: `/events/${e.slug}`,
                value: e.clicks,
              }))}
              emptyText="No outbound clicks yet."
              colorClass="bg-accent-600"
            />
            <TopCard
              eyebrow="Top categories"
              title="What people are looking for"
              href={`/events`}
              rows={(summary.top_categories ?? []).map((c) => ({
                key: c.slug,
                title: c.name,
                href: `/events?category=${c.slug}`,
                value: Math.round(c.share * 100),
                suffix: "%",
                showBar: true,
              }))}
              emptyText="No category views yet."
              colorClass="bg-accent"
            />
          </section>

          {/* Row 5 — Forms + sub-areas + recent activity */}
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Forms / signups */}
            <div className="rounded-lg border border-rule bg-paper p-6">
              <span className="eyebrow">Conversions</span>
              <h2 className="mt-2 font-display text-xl tracking-tight">Form activity</h2>
              <dl className="mt-6 space-y-4">
                <Stat
                  icon={FileCheck2}
                  label="Form completions"
                  value={summary.form_completions}
                  hint="Submissions + contact + custom forms"
                />
                <Stat
                  icon={MailCheck}
                  label="Email signups"
                  value={summary.email_signups}
                  hint="Friday Dispatch newsletter"
                />
              </dl>
            </div>

            {/* Sub-areas */}
            <div className="rounded-lg border border-rule bg-paper p-6 lg:col-span-2">
              <span className="eyebrow">Top sub-areas</span>
              <h2 className="mt-2 font-display text-xl tracking-tight">
                Where in the city people are looking
              </h2>
              <div className="mt-5">
                {(summary.top_sub_areas ?? []).length === 0 ? (
                  <p className="text-sm text-ink-500">No sub-area views yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {(summary.top_sub_areas ?? []).slice(0, 5).map((s) => {
                      const max = Math.max(
                        ...(summary.top_sub_areas ?? []).map((x) => x.views),
                        1,
                      );
                      const pct = (s.views / max) * 100;
                      return (
                        <li key={s.name}>
                          <div className="flex items-baseline justify-between gap-3 text-sm">
                            <Link
                              href={`/events?sub_area=${encodeURIComponent(s.name)}`}
                              target="_blank"
                              className="text-ink hover:text-accent-700 transition-colors"
                            >
                              {s.name}
                            </Link>
                            <span className="font-mono text-xs text-ink-500">
                              {s.views.toLocaleString()} views
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                            <div
                              className="h-full rounded-full bg-accent-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Row 6 — Recent activity */}
          {summary.recent && summary.recent.length > 0 && (
            <section className="mt-6 rounded-lg border border-rule bg-paper">
              <div className="flex items-center justify-between border-b border-rule px-6 py-4">
                <span className="eyebrow">Recent activity</span>
                <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
                  Last {summary.recent.length} events
                </span>
              </div>
              <ul className="divide-y divide-rule">
                {summary.recent.slice(0, 20).map((r, i) => (
                  <li key={`${r.ts}-${i}`} className="grid grid-cols-12 items-center gap-3 px-6 py-2.5 text-sm">
                    <span className="col-span-3 font-mono text-xs text-ink-500">
                      {formatEventDate(r.ts.slice(0, 10))} · {relativeTime(r.ts)}
                    </span>
                    <span className="col-span-2">
                      <EventTypeBadge type={r.type} />
                    </span>
                    <span className="col-span-4 truncate font-mono text-xs text-ink-700">
                      {r.path ?? r.event_id ?? "—"}
                    </span>
                    <span className="col-span-3 truncate text-xs text-ink-500">
                      {r.ref ?? "direct"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  spark,
  sparkClass = "stroke-ember-600",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  spark?: number[];
  sparkClass?: string;
}) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-5">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-display text-3xl tracking-tight tabular-nums text-ink">{value}</div>
        {spark && spark.length > 1 && (
          <Sparkline values={spark} width={88} height={28} strokeClassName={sparkClass} />
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <p className="font-display text-2xl tabular-nums">{value.toLocaleString()}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
}

function TopCard({
  eyebrow,
  title,
  rows,
  href,
  emptyText,
  colorClass,
}: {
  eyebrow: string;
  title: string;
  rows: {
    key: string;
    title: string;
    href: string;
    value: number;
    suffix?: string;
    showBar?: boolean;
  }[];
  href: string;
  emptyText: string;
  colorClass: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="rounded-lg border border-rule bg-paper p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-2 font-display text-xl tracking-tight">{title}</h2>
        </div>
        <Link
          href={href}
          className="text-xs text-ink-500 hover:text-ink inline-flex items-center gap-1"
        >
          All
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <li className="text-sm text-ink-500">{emptyText}</li>
        ) : (
          rows.map((r) => {
            const pct = (r.value / max) * 100;
            return (
              <li key={r.key}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <Link
                    href={r.href}
                    target="_blank"
                    className="truncate text-ink hover:text-accent-700 transition-colors"
                  >
                    {r.title}
                  </Link>
                  <span className="font-mono text-xs text-ink-500 tabular-nums">
                    {r.value.toLocaleString()}
                    {r.suffix ?? ""}
                  </span>
                </div>
                {r.showBar && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                    <div className={colorClass + " h-full rounded-full"} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function EventTypeBadge({ type }: { type: "page_view" | "outbound_click" | "form_completion" }) {
  const map = {
    page_view: { label: "Page view", cls: "bg-cream-200 text-ink-700" },
    outbound_click: { label: "Click", cls: "bg-accent-100 text-accent-700" },
    form_completion: { label: "Form", cls: "bg-ember-100 text-ember-700" },
  } as const;
  const m = map[type];
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2 font-mono text-[0.6rem] uppercase tracking-wider ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function prettySource(s: string): string {
  if (s === "(direct)") return "Direct";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-lg border-2 border-dashed border-rule bg-paper px-8 py-20 text-center">
      <Inbox className="mx-auto h-8 w-8 text-ink-400" />
      <h3 className="mt-4 font-display text-xl tracking-tight">No analytics yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Pageviews and outbound clicks will appear here as visitors interact with the site. Hit a few pages
        yourself, click an outbound link, or subscribe to the newsletter — then refresh.
      </p>
      <p className="mx-auto mt-3 max-w-md text-xs text-ink-400 font-mono">
        Events are appended to <code>data/analytics.ndjson</code>.
      </p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-10 space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}