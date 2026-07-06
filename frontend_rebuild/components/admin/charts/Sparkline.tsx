"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Sparkline — small inline-SVG line, no axes. Used inside KPI cards.
 * Pure presentational; if `data` is empty or all-zero, renders nothing.
 */
export function Sparkline({
  values,
  width = 88,
  height = 28,
  className,
  strokeClassName = "stroke-ink",
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  strokeClassName?: string;
}) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("block", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
    </svg>
  );
}