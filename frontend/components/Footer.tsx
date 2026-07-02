"use client";

import Link from "next/link";
import { useState } from "react";
import { postSubscriber, trackFormSubmission } from "@/lib/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("err");
      return;
    }
    const r = await postSubscriber(email);
    if (r.ok) {
      setStatus("ok");
      trackFormSubmission("footer-subscribe");
      setEmail("");
    } else setStatus("err");
    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <footer className="bg-ink text-ivory mt-24 relative">
      {/* Hazard stripe top */}
      <div className="hazard-stripes h-2" aria-hidden />

      <div className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24">
        {/* Headline footer */}
        <div className="grid grid-cols-12 gap-6 md:gap-10 mb-14">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-5 !text-ivory before:bg-accent">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                THE WEEKEND DISPATCH
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Friday morning: ten hand-picked
              <br className="hidden md:block" />{" "}
              things to do this weekend —{" "}
              <span className="italic text-accent">in your inbox.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 flex items-end">
            <form onSubmit={submit} className="w-full">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <div className="flex border border-ivory focus-within:outline focus-within:outline-2 focus-within:outline-accent">
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.bd"
                  className="flex-1 bg-transparent px-4 py-3 text-sm placeholder:text-ivory/40 focus:outline-none min-w-0"
                  aria-invalid={status === "err"}
                  aria-describedby="footer-email-help"
                />
                <button
                  type="submit"
                  className="px-5 bg-accent text-ivory font-medium text-sm uppercase tracking-wider hover:bg-accent-2 min-h-[44px] transition-colors"
                >
                  {status === "ok" ? "Subscribed ✓" : status === "err" ? "Retry" : "Subscribe"}
                </button>
              </div>
              <p
                id="footer-email-help"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory/60 mt-2"
              >
                {status === "ok"
                  ? "● You're on the list. Look for the first issue on Friday."
                  : status === "err"
                  ? "● Enter a valid email — try again."
                  : "● Fridays, 09:00 BD · No spam, easy to leave."}
              </p>
            </form>
          </div>
        </div>

        <div className="border-t border-ivory/15 pt-12 grid grid-cols-12 gap-6 md:gap-10">
          {/* Identity */}
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span
                aria-hidden
                className="w-10 h-10 bg-ivory text-ink font-display text-2xl flex items-center justify-center"
              >
                চলো
              </span>
              <span className="font-display text-2xl tracking-tightest">CHOLO JAI</span>
            </div>
            <p className="font-serif text-[15px] leading-relaxed text-ivory/85 max-w-md">
              A curated editorial index of events worth going to — workshops, gigs,
              Iftar walks, weekend runs, exhibitions.{" "}
              <span className="italic text-accent">Hand-edited daily.</span>
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-4 max-w-sm text-xs font-mono uppercase tracking-wider">
              <div>
                <dt className="text-ivory/50">Issue</dt>
                <dd className="text-ivory text-base font-display tracking-tight mt-1">
                  № 07
                </dd>
              </div>
              <div>
                <dt className="text-ivory/50">Last update</dt>
                <dd className="text-ivory text-base font-display tracking-tight mt-1">
                  09:00 BD
                </dd>
              </div>
              <div>
                <dt className="text-ivory/50">Status</dt>
                <dd className="text-accent text-base font-display tracking-tight mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent pulse-dot" aria-hidden />
                  Active
                </dd>
              </div>
              <div>
                <dt className="text-ivory/50">Pilot</dt>
                <dd className="text-ivory text-base font-display tracking-tight mt-1">
                  Day 09 / 30
                </dd>
              </div>
            </dl>
          </div>

          {/* Index */}
          <div className="col-span-6 md:col-span-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-4">
              ▸ Index
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Home", "/"],
                ["All Events", "/events"],
                ["Weekend", "/events?filter=weekend"],
                ["Free", "/events?filter=free"],
                ["Submit", "/submit"],
              ].map(([t, h]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="text-ivory/85 hover:text-accent link-accent"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-4">
              ▸ Follow
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                ["Instagram", "https://instagram.com/cholojai.bd"],
                ["Facebook", "https://facebook.com/cholojai"],
                ["X / Twitter", "https://x.com/cholojai_bd"],
                ["hello@cholojai.bd", "mailto:hello@cholojai.bd"],
              ].map(([t, h]) => (
                <li key={t}>
                  <a
                    href={h}
                    className="text-ivory/85 hover:text-accent link-accent break-words"
                    target={h.startsWith("http") ? "_blank" : undefined}
                    rel={h.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-4">
              ▸ Colophon
            </h3>
            <p className="text-sm text-ivory/80 leading-relaxed font-serif">
              Set in{" "}
              <span className="italic text-ivory">Playfair Display</span> &{" "}
              <span className="text-ivory">Inter</span>. Built with care in
              Dhaka. No tracking pixels — only outbound clicks.
            </p>
            <div className="barcode h-7 mt-5 opacity-60" aria-hidden />
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-ivory/15">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory/65">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} Cholo Jai</span>
            <span className="opacity-40">·</span>
            <span>Free to list, free to browse</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Coord · 23.81°N 90.41°E</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent pulse-dot" aria-hidden />
              Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}