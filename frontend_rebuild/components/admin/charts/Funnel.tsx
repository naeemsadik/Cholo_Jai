"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface FunnelStep {
  label: string;
  value: number;
  /** Tailwind bg color class for the bar fill */
  barClass?: string;
}

/**
 * Funnel — 4 horizontal bars with drop-off percentages between steps.
 * The first bar uses the largest width; subsequent bars use the value share.
 */
export function Funnel({
  steps,
  className,
}: {
  steps: FunnelStep[];
  className?: string;
}) {
  if (!steps || steps.length === 0) {
    return (
      <div
        className={cn(
          "flex h-32 items-center justify-center rounded-lg border border-dashed border-rule bg-cream-50/40 text-sm text-ink-500",
          className,
        )}
      >
        No funnel data yet.
      </div>
    );
  }
  const top = Math.max(steps[0].value, 1);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {steps.map((s, i) => {
        const pct = (s.value / top) * 100;
        const dropFromPrev =
          i > 0 && steps[i - 1].value > 0
            ? Math.round(((steps[i - 1].value - s.value) / steps[i - 1].value) * 100)
            : null;
        return (
          <div key={s.label}>
            {dropFromPrev != null && dropFromPrev > 0 && (
              <div className="mb-1 ml-1 text-[0.65rem] font-mono uppercase tracking-wider text-ember-700">
                ↓ {dropFromPrev}% drop-off
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-700">{s.label}</span>
              <span className="font-mono text-xs text-ink-500">
                {s.value.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-cream-100">
              <div
                className={cn("h-full rounded-full transition-all", s.barClass ?? "bg-ember-600")}
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}