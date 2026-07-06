"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// SectionMobileSheet — bottom-sheet wrapper for desktop blocks that don't
// fit comfortably in a 360px screen (calendar grid, full descriptions).
// Renders only on <lg. The desktop layout inside `children` is unchanged.
// ──────────────────────────────────────────────────────────────────────────

interface SectionMobileSheetProps {
  /** Label on the trigger button (e.g. "Pick a date"). */
  triggerLabel: string;
  /** Title shown at the top of the sheet (e.g. "Pick a day"). */
  title: string;
  /** Optional description under the title. */
  description?: string;
  /** Optional preview block on the trigger — small thumbnail or summary. */
  preview?: React.ReactNode;
  /** The desktop block to expose inside the sheet. */
  children: React.ReactNode;
  /** Tailwind classes for the trigger wrapper. */
  triggerClassName?: string;
}

export function SectionMobileSheet({
  triggerLabel,
  title,
  description,
  preview,
  children,
  triggerClassName,
}: SectionMobileSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "lg:hidden group flex w-full items-center gap-3 rounded-lg border border-rule bg-paper p-4 text-left transition-colors hover:bg-cream-50",
            triggerClassName,
          )}
        >
          {preview && <div className="shrink-0">{preview}</div>}
          <div className="min-w-0 flex-1">
            <p className="font-display text-base leading-snug text-ink">{triggerLabel}</p>
            {description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{description}</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl px-0 pb-[max(env(safe-area-inset-bottom,0px),1rem)]"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-rule" aria-hidden />
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4 px-4 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}