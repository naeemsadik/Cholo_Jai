"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface Point {
  date: string;
  pageviews: number;
  outbound_clicks: number;
}

/**
 * LineChart — full-width time-series with two series (pageviews solid,
 * outbound clicks dashed). Hand-rolled SVG; no chart library.
 *
 * Hover shows a tooltip with the day's values. Cursor area is a transparent
 * overlay rect; we use mousemove (not pointerover) to keep things smooth on
 * touchpads.
 */
export function LineChart({
  data,
  className,
  height = 240,
}: {
  data: Point[];
  className?: string;
  height?: number;
}) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [width, setWidth] = React.useState(800);

  // Track container width so the chart scales fluidly.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(320, Math.floor(entry.contentRect.width)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padding = { top: 12, right: 16, bottom: 28, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <div
        ref={wrapRef}
        className={cn(
          "flex h-[240px] items-center justify-center rounded-lg border border-dashed border-rule bg-cream-50/40 text-sm text-ink-500",
          className,
        )}
      >
        No data in range.
      </div>
    );
  }

  const maxY = Math.max(...data.flatMap((d) => [d.pageviews, d.outbound_clicks]), 1);
  const ySteps = 4;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const xFor = (i: number) => padding.left + i * stepX;
  const yFor = (v: number) => padding.top + innerH - (v / maxY) * innerH;

  const pvPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(d.pageviews).toFixed(2)}`)
    .join(" ");
  const clicksPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(d.outbound_clicks).toFixed(2)}`)
    .join(" ");

  // X-axis labels — show every 5th day, plus the last day.
  const labelEvery = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % labelEvery === 0 || i === data.length - 1);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const ratio = width / rect.width;
    const x = (e.clientX - rect.left) * ratio - padding.left;
    if (x < 0 || x > innerW) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.round(x / stepX);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const hover = hoverIdx != null ? data[hoverIdx] : null;

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        className="block"
      >
        {/* Y gridlines + labels */}
        {Array.from({ length: ySteps + 1 }).map((_, i) => {
          const v = (maxY / ySteps) * i;
          const y = padding.top + innerH - (v / maxY) * innerH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={padding.left + innerW}
                y1={y}
                y2={y}
                strokeWidth={1}
                className="stroke-rule"
                strokeDasharray="2 4"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                className="fill-ink-500 font-mono"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map(({ d, i }) => (
          <text
            key={d.date}
            x={xFor(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize={10}
            className="fill-ink-500 font-mono"
          >
            {d.date.slice(5)}
          </text>
        ))}

        {/* Pageviews line — solid */}
        <path
          d={pvPath}
          fill="none"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-ember-600"
        />
        {/* Outbound clicks line — dashed */}
        <path
          d={clicksPath}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 4"
          className="stroke-accent-600"
        />

        {/* Hover dot + crosshair */}
        {hoverIdx != null && hover && (
          <g>
            <line
              x1={xFor(hoverIdx)}
              x2={xFor(hoverIdx)}
              y1={padding.top}
              y2={padding.top + innerH}
              strokeWidth={1}
              className="stroke-ink-300"
            />
            <circle
              cx={xFor(hoverIdx)}
              cy={yFor(hover.pageviews)}
              r={3.5}
              className="fill-ember-600"
            />
            <circle
              cx={xFor(hoverIdx)}
              cy={yFor(hover.outbound_clicks)}
              r={3.5}
              className="fill-accent-600"
            />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hover && hoverIdx != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-rule bg-paper px-3 py-2 text-xs shadow-paper"
          style={{
            left: `${(xFor(hoverIdx) / width) * 100}%`,
            top: `${(yFor(hover.pageviews) / height) * 100}%`,
          }}
        >
          <div className="font-mono uppercase tracking-wider text-[0.6rem] text-ink-500">
            {hover.date}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ember-600" />
            <span className="text-ink-700">Pageviews</span>
            <span className="ml-auto font-medium text-ink">{hover.pageviews}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-600" />
            <span className="text-ink-700">Outbound clicks</span>
            <span className="ml-auto font-medium text-ink">{hover.outbound_clicks}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-ink-700">
          <span className="h-2 w-3 rounded-sm bg-ember-600" />
          Pageviews
        </span>
        <span className="inline-flex items-center gap-1.5 text-ink-700">
          <span
            className="h-0.5 w-3 bg-accent-600"
            style={{ borderTop: "2px dashed currentColor" }}
          />
          Outbound clicks
        </span>
      </div>
    </div>
  );
}