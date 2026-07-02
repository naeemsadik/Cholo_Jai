"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/events", label: "All events" },
  { href: "/events?weekend=true", label: "This weekend" },
  { href: "/events?featured=true", label: "Featured" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          className="flex h-16 md:h-[72px] items-center justify-between gap-6"
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
            <Link
              href="/events"
              aria-label="Search events"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/submit">Submit an event</Link>
            </Button>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-100 transition-colors"
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
                      <span className="sr-only">Close</span>
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
                        <Link href="/admin">Admin</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild variant="primary" className="w-full" size="lg">
                        <Link href="/submit">Submit an event</Link>
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}