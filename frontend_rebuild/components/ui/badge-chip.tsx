"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
}

// Editorial chip used for filter pills — clean rounded-rect, hairline border
const SelectChip = React.forwardRef<HTMLButtonElement, SelectChipProps>(
  ({ className, active, count, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "group inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50",
          active
            ? "border-ink bg-ink text-paper"
            : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink",
          className,
        )}
        {...props}
      >
        {children}
        {typeof count === "number" && (
          <span
            className={cn(
              "ml-1 text-xs tabular-nums",
              active ? "text-paper/70" : "text-ink-400",
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  },
);
SelectChip.displayName = "SelectChip";

export { SelectChip };