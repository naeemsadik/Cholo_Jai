"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DonutSlice {
  label: string;
  value: number;
  /** Tailwind class for the stroke color, e.g. "stroke-ember-600" */
  colorClass?: string;
}

/**
 * Donut chart — sources breakdown. Computes stroke-dasharray on each ring
 * segment. Pure SVG; no external chart library.
 */
export function Donut({
  slices,
  size = 160,
  thickness = 18,
  className,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex h-[160px] items-center justify-center rounded-lg border border-dashed border-rule bg-cream-50/40 text-sm text-ink-500",
          className,
        )}
      >
        No traffic sources yet.
      </div>
    );
  }

  // Build cumulative offsets.
  let offset = 0;
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-cream-200"
          />
          {slices.map((s, i) => {
            const len = (s.value / total) * circumference;
            const dash = `${len} ${circumference - len}`;
            const seg = (
              <circle
                key={`${s.label}-${i}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                className={cn("transition-colors", s.colorClass ?? "stroke-ink")}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-2xl tracking-tight text-ink">{centerValue}</span>
            {centerLabel && (
              <span className="mt-0.5 text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {slices.map((s, i) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li key={`${s.label}-${i}`} className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-sm",
                  s.colorClass?.replace("stroke-", "bg-") ?? "bg-ink",
                )}
              />
              <span className="text-ink-700">{s.label}</span>
              <span className="ml-auto font-mono text-xs text-ink-500">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}