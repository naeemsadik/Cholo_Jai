"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, CalendarDays, Inbox, Sparkles } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { SelectChip } from "@/components/ui/badge-chip";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

const NAV_ITEMS_KEYS = [
  { href: "/events", labelKey: "allEvents" as const },
  { href: "/events?weekend=true", labelKey: "thisWeekend" as const },
  { href: "/events?featured=true", labelKey: "featured" as const },
  { href: "/about", labelKey: "about" as const },
];

const QUICK_SEARCHES_KEYS = [
  { labelKey: "quickFreeEntry" as const, href: "/events?price=free" },
  { labelKey: "quickThisWeekend" as const, href: "/events?weekend=true" },
  { labelKey: "quickFeatured" as const, href: "/events?featured=true" },
  { labelKey: "quickToday" as const, href: "/events?when=today" },
];

export function Nav() {
  const pathname = usePathname();
  const t = useT();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState("");

  const NAV_ITEMS = NAV_ITEMS_KEYS.map((i) => ({
    href: i.href,
    label: t("nav", i.labelKey),
  }));
  const QUICK_SEARCHES = QUICK_SEARCHES_KEYS.map((q) => ({
    label: t("nav", q.labelKey),
    href: q.href,
  }));

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearchOpen(false);
    window.location.href = `/events?q=${encodeURIComponent(searchQ.trim())}`;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-rule"
          : "bg-background/0 border-b border-transparent",
      )}
    >
      <div className="editorial-container">
        <nav
          aria-label="Primary"
          className="flex h-16 md:h-[72px] items-center justify-between gap-3 md:gap-6"
        >
          <Logo />

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/events"
                  ? pathname?.startsWith("/events")
                  : pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-ink",
                      isActive ? "text-ink" : "text-ink-500",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              aria-label={t("nav", "searchEvents")}
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink"
            >
              <Search className="h-4 w-4" />
            </button>
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">{t("nav", "admin")}</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/submit">{t("nav", "submitAnEvent")}</Link>
            </Button>
          </div>

          {/* Mobile nav — three icons: Search · This weekend · Menu */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              aria-label={t("nav", "searchEvents")}
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-cream-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <LanguageSwitcher className="h-11 px-3 text-base" />
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={t("nav", "openMenu")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-cream-100 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="px-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between px-6 pb-2">
                    <Logo />
                    <SheetClose className="rounded-full p-2 -mr-2 text-ink hover:bg-cream-100">
                      <X className="h-5 w-5" />
                      <span className="sr-only">{t("common", "close")}</span>
                    </SheetClose>
                  </div>
                  <nav aria-label="Mobile" className="flex-1 px-6 pt-8">
                    <ul className="space-y-2">
                      {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                          <SheetClose asChild>
                            <Link
                              href={item.href}
                              className="block py-3 font-display text-2xl text-ink hover:text-accent-500 transition-colors"
                            >
                              {item.label}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <div className="border-t border-rule px-6 py-6 space-y-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full" size="lg">
                        <Link href="/admin">{t("nav", "admin")}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="primary" className="w-full" size="lg">
                        <Link href="/submit">{t("nav", "submitAnEvent")}</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* Search sheet — works on both mobile and desktop. */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="inset-x-0 top-0 max-h-[60vh] rounded-b-2xl px-0 pb-[max(env(safe-area-inset-bottom,0px),1rem)]">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-rule" aria-hidden />
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>{t("nav", "findSomethingToDo")}</SheetTitle>
            <SheetDescription>{t("nav", "searchDescription")}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6 pt-4">
            <form onSubmit={submitSearch}>
              <Input
                type="search"
                placeholder={t("nav", "searchPlaceholder")}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="h-12 text-base"
                aria-label={t("nav", "searchEvents")}
                autoFocus
              />
            </form>
            <div className="mt-4">
              <span className="eyebrow mb-2 block">{t("nav", "orTryOneOfThese")}</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_SEARCHES.map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    onClick={() => setSearchOpen(false)}
                  >
                    <SelectChip>{q.label}</SelectChip>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

// Re-export icons so other modules can import from a single place if needed.
export { Sparkles, Inbox };