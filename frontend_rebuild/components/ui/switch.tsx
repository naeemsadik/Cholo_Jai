"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: string;
}

/**
 * Lightweight, accessible toggle switch.
 * Uses a `<button role="switch">` so it works without depending on Radix.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ checked, onCheckedChange, label, className, disabled, ...rest }, ref) {
    return (
      <button
        ref={ref}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-ink" : "bg-cream-200",
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-paper shadow-paper-sm transition-transform",
            checked && "translate-x-[22px]",
          )}
        />
      </button>
    );
  },
);
