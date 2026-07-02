"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "@/lib/util";

const links = [
  { href: "/events", label: "Index" },
  { href: "/events?filter=weekend", label: "Weekend" },
  { href: "/events?filter=free", label: "Free" },
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-nav bg-paper transition-shadow",
        scrolled ? "shadow-[0_1px_0_0_rgba(14,14,12,1)]" : "border-b border-ink"
      )}
    >
      <div className="mx-auto max-w-ed px-5 md:px-8">
        {/* Masthead row */}
        <div className="grid grid-cols-12 items-center gap-4 h-16 md:h-20">
          {/* Wordmark */}
          <Link href="/" className="col-span-6 md:col-span-3 flex items-center gap-3 group focus-ring">
            <span
              aria-hidden
              className="w-9 h-9 md:w-10 md:h-10 bg-ink text-ivory flex items-center justify-center font-display text-xl md:text-2xl"
            >
              চলো
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-xl md:text-2xl tracking-tightest text-ink">
                CHOLO JAI
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mt-0.5">
                Dhaka · BD
              </span>
            </span>
          </Link>

          {/* Center: editorial label */}
          <div className="hidden md:flex col-span-6 justify-center">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-ink/70">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent pulse-dot" aria-hidden />
                Live
              </span>
              <span className="opacity-40">/</span>
              <span>
                <span className="font-semibold text-ink">{now || "—"}</span> BD
              </span>
              <span className="opacity-40">/</span>
              <span>Vol. 01 · Issue 07</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-2 md:gap-3">
            <Link
              href="/submit"
              className="hidden md:inline-flex btn-accent h-10 px-4 text-[11px]"
            >
              <span className="opacity-80">＋</span> List event
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="md:hidden btn-icon h-10 w-10"
            >
              <svg
                width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                aria-hidden
              >
                {open ? (
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M4 7h16" strokeLinecap="round" />
                    <path d="M4 12h12" strokeLinecap="round" />
                    <path d="M4 17h8" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Secondary nav row */}
        <nav className="hidden md:flex items-center justify-center border-t border-ink/15 h-12 gap-6">
          {links.map((l) => {
            const active =
              path === l.href.split("?")[0] ||
              (l.href === "/events" && path?.startsWith("/events"));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative font-mono text-[11px] uppercase tracking-[0.18em] font-medium py-3 focus-ring",
                  active ? "text-accent" : "text-ink/70 hover:text-ink"
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-drawer md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute top-0 right-0 bottom-0 w-[88vw] max-w-sm bg-paper border-l border-ink flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-ink">
              <span className="font-display text-xl tracking-tightest">CHOLO JAI</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="btn-icon h-10 w-10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {links.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-6 py-5 border-b border-ink/15 font-display text-2xl tracking-tight"
                >
                  <span>
                    <span className="text-xs font-mono text-ink/40 mr-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {l.label}
                  </span>
                  <span className="text-accent text-lg" aria-hidden>→</span>
                </Link>
              ))}
              <div className="p-5">
                <Link
                  href="/submit"
                  onClick={() => setOpen(false)}
                  className="btn-accent w-full"
                >
                  <span>＋</span> List your event
                </Link>
              </div>
            </div>
            <div className="p-5 border-t border-ink/15 text-[11px] font-mono uppercase tracking-widest text-ink/60">
              Vol. 01 · Dhaka, BD · {now || "—"}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}