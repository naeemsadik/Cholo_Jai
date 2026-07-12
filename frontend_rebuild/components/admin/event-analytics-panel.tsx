"use client";

import * as React from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGetEventAnalytics } from "@/lib/api";
import type { EventAnalyticsDetail } from "@/lib/types";
import { LineChart } from "./charts/LineChart";
import { Donut } from "./charts/Donut";
import { Sparkline } from "./charts/Sparkline";
import { relativeTime, formatEventDate } from "@/lib/utils";

const SOURCE_COLOR_CLASSES = [
  "stroke-ember-600",
  "stroke-accent-600",
  "stroke-sky-500",
  "stroke-ink",
  "stroke-cream-400",
];

interface EventAnalyticsPanelProps {
  eventId: string;
  onClose: () => void;
}

export function EventAnalyticsPanel({ eventId, onClose }: EventAnalyticsPanelProps) {
  const [range, setRange] = React.useState<"7d" | "30d">("30d");
  const [data, setData] = React.useState<EventAnalyticsDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await adminGetEventAnalytics(eventId, range);
    if (res.error) {
      setError(res.error);
    } else {
      setData(res.data);
    }
    setLoading(false);
  }, [eventId, range]);

  React.useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const isEmpty = !loading && data && data.total_pageviews === 0 && data.total_outbound_clicks === 0;

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto p-1">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-rule pb-4">
        <div>
          <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
            Event Specific Analytics
          </span>
          <h2 className="font-display text-2xl tracking-tight mt-1 text-ink line-clamp-1">
            {loading ? <Skeleton className="h-8 w-64" /> : data?.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-rule overflow-hidden bg-paper">
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                range === "7d"
                  ? "bg-accent-600 text-white"
                  : "text-ink-700 hover:bg-cream-100"
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                range === "30d"
                  ? "bg-accent-600 text-white"
                  : "text-ink-700 hover:bg-cream-100"
              }`}
            >
              30d
            </button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <PanelSkeleton />
      ) : error ? (
        <div className="mt-6 rounded-md border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-700">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="py-20 text-center">
          <Calendar className="mx-auto h-8 w-8 text-ink-400" />
          <h3 className="mt-4 font-display text-xl tracking-tight">No analytics recorded yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            This event hasn't received any pageviews or outbound clicks during the selected period.
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6 mt-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard
              icon={Eye}
              label="Pageviews"
              value={data.total_pageviews.toLocaleString()}
              spark={data.daily.map((d) => d.pageviews)}
            />
            <KpiCard
              icon={MousePointerClick}
              label="Outbound clicks"
              value={data.total_outbound_clicks.toLocaleString()}
              spark={data.daily.map((d) => d.outbound_clicks)}
              sparkClass="stroke-accent-600"
            />
            <KpiCard
              icon={TrendingUp}
              label="CTR / Conversion"
              value={`${(data.conversion_rate * 100).toFixed(1)}%`}
              sub="Clicks / Pageviews"
            />
            <KpiCard
              icon={Users}
              label="Sessions"
              value={data.unique_sessions.toLocaleString()}
              sub="Unique visitors"
            />
          </div>

          {/* Time Series chart */}
          <div className="rounded-lg border border-rule bg-paper p-5">
            <h3 className="font-display text-lg tracking-tight mb-4">Traffic over time</h3>
            <div className="h-64">
              <LineChart data={data.daily} />
            </div>
          </div>

          {/* Traffic Sources & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Traffic Sources */}
            <div className="rounded-lg border border-rule bg-paper p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg tracking-tight mb-4">Traffic sources</h3>
                <div className="flex justify-center my-4">
                  <Donut
                    slices={data.traffic_sources.slice(0, 5).map((s, i) => ({
                      label: s.source === "(direct)" ? "Direct" : s.source.charAt(0).toUpperCase() + s.source.slice(1),
                      value: s.pageviews,
                      colorClass: SOURCE_COLOR_CLASSES[i % SOURCE_COLOR_CLASSES.length],
                    }))}
                    centerValue={data.traffic_sources.reduce((s, x) => s + x.pageviews, 0).toLocaleString()}
                    centerLabel="Views"
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-2 rounded-lg border border-rule bg-paper p-5">
              <h3 className="font-display text-lg tracking-tight mb-4">Recent activity</h3>
              {data.recent.length === 0 ? (
                <p className="text-xs text-ink-500 italic">No recent events logged.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-rule rounded divide-y divide-rule font-mono text-xs">
                  {data.recent.slice(0, 10).map((r, i) => (
                    <div key={i} className="flex justify-between p-2 hover:bg-cream-50">
                      <span className="text-ink-500">
                        {formatEventDate(r.ts.slice(0, 10))} · {relativeTime(r.ts)}
                      </span>
                      <span className={`px-1.5 rounded uppercase font-semibold text-[10px] ${
                        r.type === "page_view"
                          ? "bg-cream-200 text-ink-700"
                          : "bg-accent-100 text-accent-700"
                      }`}>
                        {r.type === "page_view" ? "View" : "Click"}
                      </span>
                      <span className="truncate max-w-[150px] text-ink-600">{r.ref || "direct"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
    <div className="rounded-lg border border-rule bg-paper p-4">
      <div className="flex items-center gap-2 text-ink-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[0.6rem] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="font-display text-2xl tracking-tight text-ink">{value}</div>
        {spark && spark.length > 1 && (
          <Sparkline values={spark} width={64} height={20} strokeClassName={sparkClass} />
        )}
      </div>
      {sub && <div className="mt-1 text-[10px] text-ink-500">{sub}</div>}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 md:col-span-2 w-full" />
      </div>
    </div>
  );
}
