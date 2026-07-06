"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// MobileStickyBar — fixed bottom action bar, visible only on <lg.
// Pinned to viewport so the primary action is always in thumb-reach.
// Safe-area aware (iOS home indicator + Android nav bar).
// ──────────────────────────────────────────────────────────────────────────

interface MobileStickyBarProps {
  /** Optional metadata chip on the left (price, status, etc.). */
  meta?: React.ReactNode;
  /** Primary CTA — always rendered. Use href or onClick, not both. */
  primary: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  };
  /** Optional kebab menu — opens a Sheet of secondary actions. */
  secondary?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
  /** Slot for rendering a Sheet trigger — used by callers to wire the
   *  bottom-sheet of secondary actions (Share, Add to calendar, Maps). */
  secondarySlot?: React.ReactNode;
  /** Hide on lg+ — defaults true. */
  hideOnDesktop?: boolean;
  className?: string;
}

export function MobileStickyBar({
  meta,
  primary,
  secondary,
  secondarySlot,
  hideOnDesktop = true,
  className,
}: MobileStickyBarProps) {
  return (
    <div
      role="region"
      aria-label="Primary actions"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 backdrop-blur-md",
        // Respect iOS safe area
        "pb-[max(env(safe-area-inset-bottom,0px),0.5rem)]",
        // Hide on lg+ unless explicitly disabled
        hideOnDesktop && "lg:hidden",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 px-4 pt-3">
        {meta && (
          <div className="shrink-0 text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
            {meta}
          </div>
        )}

        {primary.href ? (
          <Link
            href={primary.href}
            target={primary.href.startsWith("http") ? "_blank" : undefined}
            rel={primary.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={cn(
              "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ember px-5 text-sm font-semibold text-paper shadow-paper transition-colors hover:bg-ember-600 active:bg-ember-700",
              primary.disabled && "pointer-events-none opacity-60",
            )}
          >
            {primary.icon}
            {primary.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled}
            className={cn(
              "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-ember px-5 text-sm font-semibold text-paper shadow-paper transition-colors hover:bg-ember-600 active:bg-ember-700",
              primary.disabled && "opacity-60",
            )}
          >
            {primary.icon}
            {primary.label}
          </button>
        )}

        {/* Secondary action — either explicit kebab that wires a caller-provided
            Sheet (via secondarySlot) or a stack of inline buttons. */}
        {secondarySlot ? (
          secondarySlot
        ) : secondary && secondary.length > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            {secondary.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                aria-label={s.label}
                className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-rule bg-paper text-ink transition-colors hover:bg-cream-100"
              >
                {s.icon ?? <MoreHorizontal className="h-5 w-5" />}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}