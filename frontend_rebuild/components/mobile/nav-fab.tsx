"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Sparkles, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// NavFab — floating action button row at the bottom-left of the viewport.
// Three shortcuts: Today, This weekend, All events. Saves the user a
// tap through the hamburger nav. Hides on scroll-down (reappears on scroll-up).
// `prefers-reduced-motion` users see it always.
// ──────────────────────────────────────────────────────────────────────────

interface NavFabProps {
  /** Currently active filter — one of "today" | "weekend" | undefined. */
  active?: "today" | "weekend" | "all";
}

export function NavFab({ active }: NavFabProps) {
  const [visible, setVisible] = React.useState(true);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // always visible

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      // Hide when scrolling down, show when scrolling up
      if (delta > 4 && y > 80) setVisible(false);
      else if (delta < -4) setVisible(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { key: "today", href: "/events?when=today", label: "Today", icon: Sparkles },
    { key: "weekend", href: "/events?weekend=true", label: "Weekend", icon: CalendarDays },
    { key: "all", href: "/events", label: "All", icon: Inbox },
  ] as const;

  return (
    <nav
      aria-label="Quick date filters"
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] z-30 mx-auto flex w-fit items-center gap-1 rounded-full border border-rule bg-paper/95 p-1 shadow-paper-lg backdrop-blur-md transition-transform duration-300",
        // Hide on lg+
        "lg:hidden",
        // Scroll-direction visibility (transform keeps layout stable)
        visible ? "translate-y-0" : "translate-y-[200%]",
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-ink text-paper"
                : "text-ink-700 hover:bg-cream-100",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}