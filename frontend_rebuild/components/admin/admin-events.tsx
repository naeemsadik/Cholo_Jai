"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight,
  LogOut,
  Search,
  Plus,
  Archive,
  Eye,
  EyeOff,
  Check,
  X,
  Filter,
  BarChart3,
  Inbox,
  Pencil,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/site/logo";
import { getAdminEvents, getAdminSubmissions } from "@/lib/api";
import { formatEventDate, formatPrice, relativeTime } from "@/lib/utils";
import type { Event, Submission, EventStatus } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";

export function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | EventStatus>("all");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [e, s] = await Promise.all([getAdminEvents(), getAdminSubmissions()]);
      if (!mounted) return;
      setEvents(e.data);
      setSubmissions(s.data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    if (typeof window !== "undefined") sessionStorage.removeItem("cj_admin_token");
    router.push("/admin");
  }

  const filtered = events.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search && !`${e.title} ${e.venue_name} ${e.sub_area}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingSubmissions = submissions.filter((s) => s.review_status === "submitted");

  return (
    <div className="min-h-screen bg-background">
      {/* Admin topbar */}
      <header className="sticky top-0 z-30 border-b border-rule bg-paper">
        <div className="editorial-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden md:inline-block rounded-full bg-cream-200 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-wider text-ink-700">
              Admin · Internal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                View public site
                <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="editorial-container py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Operations</span>
            <h1 className="mt-3 font-display text-display-sm tracking-tight">Curation dashboard</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-500">
              {events.length} events · {pendingSubmissions.length} pending submissions · all data shown is sourced from the backend when reachable.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="md">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              New event
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Published" value={events.filter((e) => e.status === "published").length} sub="live on the site" />
          <Stat label="Featured" value={events.filter((e) => e.is_featured).length} sub="curator's picks" />
          <Stat label="Pending review" value={pendingSubmissions.length} sub="awaiting moderation" />
          <Stat label="This week" value={events.filter((e) => e.start_date >= new Date().toISOString().slice(0, 10)).length} sub="events within 7 days" />
        </div>

        <Tabs defaultValue="events" className="mt-10">
          <TabsList>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({pendingSubmissions.length})</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  placeholder="Search by title, venue, or area…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "published", "draft", "unpublished"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={filter === s ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilter(s)}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-rule overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-50 text-left">
                  <tr>
                    <th className="px-4 py-3 eyebrow font-medium">Event</th>
                    <th className="px-4 py-3 eyebrow font-medium">When</th>
                    <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Status</th>
                    <th className="px-4 py-3 eyebrow font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-t border-rule">
                          <td colSpan={5} className="px-4 py-3"><div className="h-12 shimmer rounded" /></td>
                        </tr>
                      ))
                    : filtered.map((e) => (
                        <EventRow key={e.id} event={e} />
                      ))}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <p className="mt-6 text-center text-sm text-ink-500">No events match those filters.</p>
            )}
          </TabsContent>

          {/* SUBMISSIONS TAB */}
          <TabsContent value="submissions">
            <div className="rounded-lg border border-rule overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-50 text-left">
                  <tr>
                    <th className="px-4 py-3 eyebrow font-medium">Submission</th>
                    <th className="px-4 py-3 eyebrow font-medium">When</th>
                    <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">Organizer</th>
                    <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Submitted</th>
                    <th className="px-4 py-3 eyebrow font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <tr key={i} className="border-t border-rule">
                          <td colSpan={5} className="px-4 py-3"><div className="h-12 shimmer rounded" /></td>
                        </tr>
                      ))
                    : submissions.length === 0
                    ? (
                      <tr><td colSpan={5} className="px-4 py-16 text-center text-ink-500">No submissions yet.</td></tr>
                    )
                    : submissions.map((s) => <SubmissionRow key={s.id} submission={s} />)}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ARCHIVE TAB */}
          <TabsContent value="archive">
            <p className="text-sm text-ink-500">Past and archived events will appear here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-paper p-6">
      <span className="eyebrow">{label}</span>
      <p className="mt-2 font-display text-4xl tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <tr className="border-t border-rule hover:bg-cream-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-cream-200">
            {event.poster_url && (
              <Image src={event.poster_url} alt="" fill className="object-cover" sizes="64px" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink line-clamp-1">{event.title}</p>
            <p className="text-xs text-ink-500 line-clamp-1">{event.venue_name}, {event.sub_area}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{formatEventDate(event.start_date, event.start_time)}</td>
      <td className="px-4 py-3 hidden md:table-cell">
        <Badge variant="muted">{catName(event.categories[0] ?? "")}</Badge>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <StatusPill status={event.status} featured={event.is_featured} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <Button size="icon" variant="ghost" asChild>
            <Link href={`/events/${event.slug}`} target="_blank" aria-label="Preview">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="ghost" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          {event.status === "published" ? (
            <Button size="icon" variant="ghost" aria-label="Unpublish">
              <EyeOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" aria-label="Publish">
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" aria-label="Archive">
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <tr className="border-t border-rule hover:bg-cream-50 transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-ink line-clamp-1">{submission.title}</p>
        <p className="text-xs text-ink-500 line-clamp-1">
          {submission.venue_name}, {submission.sub_area} · {catName(submission.categories[0] ?? "")}
        </p>
      </td>
      <td className="px-4 py-3 text-ink-700 whitespace-nowrap">{formatEventDate(submission.start_date, submission.start_time)}</td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-ink-700">{submission.organizer.name}</p>
        <p className="text-xs text-ink-500">{submission.organizer.phone}</p>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-ink-500 text-xs">
        {relativeTime(submission.created_at)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <Button size="sm" variant="primary">
            <Check className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button size="sm" variant="outline">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="icon" variant="ghost" aria-label="Reject">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ status, featured }: { status: EventStatus; featured: boolean }) {
  const map: Record<EventStatus, { label: string; cls: string }> = {
    published: { label: "Published", cls: "bg-accent-50 text-accent-700 border-accent-100" },
    draft: { label: "Draft", cls: "bg-cream-200 text-ink-700 border-rule" },
    submitted: { label: "Submitted", cls: "bg-cream-200 text-ink-700 border-rule" },
    unpublished: { label: "Unpublished", cls: "bg-ember-50 text-ember-700 border-ember-100" },
    archived: { label: "Archived", cls: "bg-cream-100 text-ink-500 border-rule" },
    rejected: { label: "Rejected", cls: "bg-ember-50 text-ember-700 border-ember-100" },
  };
  const s = map[status];
  return (
    <span className={cn(`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-mono uppercase tracking-wider`, s.cls)}>
      {featured && <span className="h-1 w-1 rounded-full bg-current" />}
      {s.label}
    </span>
  );
}

function cn(...args: string[]) {
  return args.filter(Boolean).join(" ");
}