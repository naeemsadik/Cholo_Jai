"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type EventSort } from "@/lib/event-sort";

// Mobile-first sort toggle. On mobile renders as a horizontal pill row above
// the results. On desktop also visible at the top of the right column to
// complement FilterSidebar's URL-driven approach.

interface SortControlProps {
  current?: EventSort;
}

export function SortControl({ current = "soonest" }: SortControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setSort(next: EventSort) {
    if (next === current) return;
    const qs = new URLSearchParams(params.toString());
    if (next === "soonest") qs.delete("sort");
    else qs.set("sort", next);
    const s = qs.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  return (
    <div className="mobile-only border-b border-rule bg-cream-50">
      <div className="editorial-container py-3">
        <div className="-mx-4 overflow-x-auto scrollbar-hide">
          <div className="flex w-max items-center gap-2 px-4 py-0.5">
            <span className="eyebrow shrink-0 inline-flex items-center gap-1.5">
              <ArrowUpDown className="h-3 w-3" aria-hidden />
              Sort
            </span>
            {SORT_OPTIONS.map((o) => {
              const active = current === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSort(o.value)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-paper text-ink-700 hover:border-ink-300",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
            <span aria-hidden className="w-2 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}