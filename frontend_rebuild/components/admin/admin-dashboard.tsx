"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Inbox,
  Eye,
  MousePointerClick,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "./charts/Sparkline";
import { StatusPill } from "./status-pill";
import { ReviewPill } from "./status-pill";
import { AdminSectionHeader } from "./admin-shell";
import {
  getAdminEvents,
  getAdminSubmissions,
  adminGetAnalyticsSummary,
} from "@/lib/api";
import type { Event, Submission } from "@/lib/types";
import type { AdminAnalyticsSummary } from "@/lib/types";
import { formatEventDate, relativeTime } from "@/lib/utils";

function pct(n: number, total: number): string {
  if (total === 0) return "0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

export function AdminDashboard() {
  const [events, setEvents] = React.useState<Event[] | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[] | null>(null);
  const [analytics, setAnalytics] = React.useState<AdminAnalyticsSummary | null>(null);

  React.useEffect(() => {
    void (async () => {
      const [e, s, a] = await Promise.all([
        getAdminEvents(),
        getAdminSubmissions(),
        adminGetAnalyticsSummary("7d"),
      ]);
      setEvents(e.data);
      setSubmissions(s.data);
      setAnalytics(a.data);
    })();
  }, []);

  const eventsArr = events ?? [];
  const subsArr = submissions ?? [];
  const a = analytics;
  const publishedCount = eventsArr.filter((e) => e.status === "published").length;
  const featuredCount = eventsArr.filter((e) => e.is_featured).length;
  const pendingSubs = subsArr.filter((s) => s.review_status === "submitted").length;

  return (
    <div className="space-y-10">
      <AdminSectionHeader
        eyebrow="Today"
        title="Dashboard"
        description="The state of Cholo Jai right now — published events, pending submissions, and last 7 days of traffic."
        actions={
          <Button asChild variant="primary" size="md">
            <Link href="/admin/events/new">
              <Plus className="h-4 w-4" />
              New event
            </Link>
          </Button>
        }
      />

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          icon={CalendarDays}
          label="Published events"
          value={events ? publishedCount.toString() : "—"}
          sub={events ? `${featuredCount} featured · ${events.length} total` : "Loading"}
        />
        <KpiCard
          icon={Inbox}
          label="Pending submissions"
          value={events ? pendingSubs.toString() : "—"}
          sub={pendingSubs > 0 ? "Awaiting your review" : "Inbox clear"}
          accent={pendingSubs > 0}
        />
        <KpiCard
          icon={Eye}
          label="Pageviews · 7d"
          value={a ? a.total_pageviews.toLocaleString() : "—"}
          sub={a ? `Conversion ${pct(a.total_outbound_clicks, a.total_pageviews)}` : "Loading"}
        />
        <KpiCard
          icon={MousePointerClick}
          label="Outbound clicks · 7d"
          value={a ? a.total_outbound_clicks.toLocaleString() : "—"}
          sub={a ? `${a.unique_sessions} sessions` : "Loading"}
        />
      </section>

      {/* Two-column: analytics preview + recent activity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Analytics preview */}
        <div className="lg:col-span-2 rounded-lg border border-rule bg-paper p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <span className="eyebrow">Traffic — last 7 days</span>
              <h2 className="mt-2 font-display text-xl tracking-tight">
                Pageviews vs outbound clicks
              </h2>
            </div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink"
            >
              Open analytics
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {a ? (
            <div className="flex items-center gap-6">
              <Sparkline
                values={a.daily.map((d) => d.pageviews)}
                width={220}
                height={56}
                strokeClassName="stroke-ember-600"
              />
              <Sparkline
                values={a.daily.map((d) => d.outbound_clicks)}
                width={220}
                height={56}
                strokeClassName="stroke-accent-600"
              />
            </div>
          ) : (
            <Skeleton className="h-14 w-full" />
          )}
          {a && (
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-rule pt-4">
              <div>
                <dt className="text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                  Form completions
                </dt>
                <dd className="mt-1 font-display text-2xl">{a.form_completions}</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                  Email signups
                </dt>
                <dd className="mt-1 font-display text-2xl">{a.email_signups}</dd>
              </div>
              <div>
                <dt className="text-[0.6rem] font-mono uppercase tracking-wider text-ink-500">
                  Conversion
                </dt>
                <dd className="mt-1 font-display text-2xl">
                  {pct(a.total_outbound_clicks, a.total_pageviews)}
                </dd>
              </div>
            </dl>
          )}
        </div>

        {/* Quick stats */}
        <div className="rounded-lg border border-rule bg-paper p-6">
          <span className="eyebrow">This week</span>
          <h2 className="mt-2 font-display text-xl tracking-tight">Quick stats</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-baseline justify-between">
              <span className="text-ink-700">Total events</span>
              <span className="font-mono text-ink">
                {events ? events.length : "—"}
              </span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="text-ink-700">Featured</span>
              <span className="font-mono text-ink">
                {events ? featuredCount : "—"}
              </span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="text-ink-700">In hero rotation</span>
              <span className="font-mono text-ink">
                {events ? events.filter((e) => e.show_in_hero).length : "—"}
              </span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="text-ink-700">Drafts</span>
              <span className="font-mono text-ink">
                {events ? events.filter((e) => e.status === "draft").length : "—"}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentEvents events={events} />
        <RecentSubmissions submissions={submissions} />
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-lg border border-ember/30 bg-ember-50/40 p-5"
          : "rounded-lg border border-rule bg-paper p-5"
      }
    >
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-3 font-display text-3xl tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
    </div>
  );
}

function RecentEvents({ events }: { events: Event[] | null }) {
  return (
    <div className="rounded-lg border border-rule bg-paper">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <span className="eyebrow">Recent events</span>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink"
        >
          All events
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-rule">
        {events === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="px-5 py-4">
              <Skeleton className="h-12 w-full" />
            </li>
          ))
        ) : events.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-ink-500">
            No events yet. Use <Link href="/admin/events/new" className="text-ink underline">New event</Link> or wait for submissions.
          </li>
        ) : (
          events
            .slice()
            .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
            .slice(0, 5)
            .map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/events/${e.slug}`}
                    className="block truncate text-sm font-medium text-ink hover:underline"
                  >
                    {e.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-ink-500">
                    <span>{formatEventDate(e.start_date)}</span>
                    <span>·</span>
                    <span>{relativeTime(e.updated_at)}</span>
                  </div>
                </div>
                <StatusPill status={e.status} />
              </li>
            ))
        )}
      </ul>
    </div>
  );
}

function RecentSubmissions({ submissions }: { submissions: Submission[] | null }) {
  return (
    <div className="rounded-lg border border-rule bg-paper">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <span className="eyebrow">Recent submissions</span>
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink"
        >
          Review queue
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-rule">
        {submissions === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="px-5 py-4">
              <Skeleton className="h-12 w-full" />
            </li>
          ))
        ) : submissions.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-ink-500">
            No submissions yet.
          </li>
        ) : (
          submissions
            .slice()
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            .slice(0, 5)
            .map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="block truncate text-sm font-medium text-ink hover:underline"
                  >
                    {s.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-ink-500">
                    <span>{s.organizer?.name ?? "Unknown organizer"}</span>
                    <span>·</span>
                    <span>{relativeTime(s.created_at)}</span>
                  </div>
                </div>
                <ReviewPill review_status={s.review_status} />
              </li>
            ))
        )}
      </ul>
    </div>
  );
}

// Avoid an unused-import warning when running with `noUnusedLocals`.
void TrendingUp;