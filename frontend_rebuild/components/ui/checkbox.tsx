"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="group inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
        <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              "peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[3px] border border-rule bg-paper transition-colors",
              "checked:border-ink checked:bg-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
          <svg
            className="pointer-events-none h-3 w-3 text-paper opacity-0 transition-opacity peer-checked:opacity-100"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label && <span className="leading-tight">{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";