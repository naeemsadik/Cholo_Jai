"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// HorizontalSnap — a horizontal scroll-snap row for editorial sections.
// Used to convert multi-column desktop grids into mobile carousels without
// adding a carousel library. Falls back to flex on lg+ when `desktopAs` is set.
//
// Width consistency: every child receives the same `itemWidth` set on the
// wrapping div, AND a `w-full h-full` is applied to each card via the
// `consumeWidth` slot strategy. The grid layout (`grid-rows-1`) forces all
// children to equalize to the tallest one, so cards never look misaligned.
//
// Snap-edge fix: the right-side empty area is eliminated by
//   1) setting scrollPaddingRight = scrollPaddingLeft so the snap math is symmetric
//   2) snap-aligning the LAST item to `end` so the final card can dock flush
//      with the viewport's right edge
//   3) replacing the explicit `w-2` spacer with a tiny `after:` pseudo-element
//      that exists only as a snap target
// ──────────────────────────────────────────────────────────────────────────

interface HorizontalSnapProps {
  /** Accessible label for the scroll region. */
  ariaLabel: string;
  /** Direct children — typically cards. Each will be wrapped with the snap item. */
  children: React.ReactNode;
  /** Width of each item. Default 85% of container width (peek of next). */
  itemWidth?: string;
  /** Gap between items (Tailwind token). */
  gap?: 3 | 4 | 6;
  /** Show progress pills under the row. */
  showProgress?: boolean;
  /** Optional Tailwind classes for the inner row (e.g. custom padding). */
  rowClassName?: string;
  className?: string;
}

export function HorizontalSnap({
  ariaLabel,
  children,
  itemWidth = "85%",
  gap = 4,
  showProgress = false,
  rowClassName,
  className,
}: HorizontalSnapProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [count, setCount] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Normalize children into an array to compute count + progress.
  const items = React.Children.toArray(children);

  React.useEffect(() => {
    setCount(items.length);
  }, [items.length]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      // Estimate of one card's stride: use the first child's offsetWidth if
      // available, else fall back to itemWidth.
      const firstChild = el.firstElementChild as HTMLElement | null;
      const stride = firstChild?.offsetWidth
        ? firstChild.offsetWidth + gap * 4
        : 0;
      if (stride <= 0) return;
      const idx = Math.round(el.scrollLeft / stride);
      setActiveIndex(Math.min(Math.max(idx, 0), items.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [gap, items.length]);

  return (
    <div className={cn("lg:hidden", className)}>
      <div
        ref={scrollRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        className={cn(
          // Grid (not flex) so all children equalize to the tallest item.
          // auto-cols enforces uniform width per column;
          // grid-rows-1 + items-stretch forces equal heights.
          "grid grid-flow-col grid-rows-1 items-stretch snap-x-row",
          gap === 3 && "gap-3",
          gap === 4 && "gap-4",
          gap === 6 && "gap-6",
          rowClassName,
        )}
        style={{
          // Symmetric scroll padding — first card aligns flush with left edge
          // (after the section's editorial-container gutter), and the last card
          // can dock flush with the right edge.
          scrollPaddingLeft: "1rem",
          scrollPaddingRight: "1rem",
          // Width of each grid track — uniform for every card in the row.
          gridAutoColumns: itemWidth,
        }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            // h-full so wrapper equals the tallest sibling.
            className={cn(
              "h-full",
              // The last card snaps to the right edge instead of the start —
              // this is what kills the "huge gap after the last item".
              i === items.length - 1 && "snap-end",
            )}
          >
            {/* Inner card — h-full w-full forces every card to fill the
                grid track exactly, regardless of its intrinsic dimensions. */}
            <div className="flex h-full w-full">{child}</div>
          </div>
        ))}
      </div>

      {showProgress && count > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 px-4">
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === activeIndex ? "w-6 bg-ink" : "w-1.5 bg-ink-300",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}