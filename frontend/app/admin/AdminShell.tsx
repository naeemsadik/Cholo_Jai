"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/util";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  return authed ? <AdminLayout>{children}</AdminLayout> : <Login onLogin={() => setAuthed(true)} />;
}

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid grid-cols-12 min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-ink text-ivory border-r border-ink">
        <div className="px-5 py-5 border-b border-ivory/15 flex items-center justify-between">
          <div>
            <div className="font-display text-xl tracking-tighter">ADMIN</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/55 mt-1">
              Unit · DHAKA-01
            </div>
          </div>
          <span className="w-1.5 h-1.5 bg-accent pulse-dot" aria-hidden />
        </div>
        <nav className="p-2" aria-label="Admin navigation">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] mb-1 focus-ring",
                  active ? "bg-accent text-ivory" : "text-ivory/85 hover:bg-ivory/5"
                )}
              >
                {l.label}
                <span aria-hidden className="opacity-60">▶</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-5 border-t border-ivory/15 mt-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory/55 mb-2">Signed in</div>
          <div className="font-display text-sm">curator@cholojai.bd</div>
          <button className="link-accent font-mono text-[10px] uppercase tracking-[0.18em] mt-3 text-ivory">
            Sign out
          </button>
        </div>
      </aside>
      <main className="col-span-12 md:col-span-9 lg:col-span-10 bg-paper">{children}</main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("curator");
  const [pass, setPass] = useState("");
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-28 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-6">
          <div className="eyebrow mb-4">Internal · Auth required</div>
          <h1 className="t-huge tracking-tighter">
            Control<br />
            <span className="font-serif italic text-accent">deck.</span>
          </h1>
          <p className="font-serif text-lg text-ink/80 max-w-lg mt-4 leading-relaxed">
            Manage <strong>submissions</strong>, edit <strong>events</strong>, mark
            featured picks, watch outbound click counts. Sign in with the credentials
            issued at onboarding.
          </p>
          <div className="mt-8 grid grid-cols-3 border border-ink">
            <Stat k="Drafts" v="03" />
            <Stat k="Pending" v="12" hazard />
            <Stat k="Live" v="48" />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
            className="border border-ink bg-bone p-6 md:p-10"
          >
            <div className="eyebrow mb-4">Credentials</div>
            <label htmlFor="admin-user" className="label-brut mb-2 block">Username</label>
            <input id="admin-user" className="input-brut mb-4" value={user} onChange={(e) => setUser(e.target.value)} />
            <label htmlFor="admin-pass" className="label-brut mb-2 block">Password</label>
            <input id="admin-pass" type="password" className="input-brut mb-5" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            <button type="submit" className="btn-accent w-full">▶ Sign in</button>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-3">
              Demo · any credentials sign in. Real auth wires to FastAPI.
            </p>
          </form>
        </div>
      </div>
      <div className="hazard-stripes h-2" aria-hidden />
    </section>
  );
}

function Stat({ k, v, hazard }: { k: string; v: string; hazard?: boolean }) {
  return (
    <div className="p-4 md:p-5 border-r border-ink last:border-r-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65">{k}</div>
      <div className={clsx("font-display huge tracking-tighter mt-1", hazard && "text-accent")}>{v}</div>
    </div>
  );
}