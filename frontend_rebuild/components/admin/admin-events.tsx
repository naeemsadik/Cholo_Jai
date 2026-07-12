"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  BarChart3,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Check,
  EyeOff,
  Archive,
  Trash2,
  RotateCcw,
  Filter,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill, ReviewPill } from "@/components/admin/status-pill";
import { toast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  getAdminEvents,
  getAdminSubmissions,
  adminSetEventStatus,
  adminDeleteEvent,
  adminSetSubmissionReview,
} from "@/lib/api";
import { formatEventDate, formatPrice, relativeTime } from "@/lib/utils";
import type { Event, Submission, EventStatus, ReviewStatus } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import { ALL_EVENT_STATUSES } from "@/lib/event-status";
import { cn } from "@/lib/utils";

const ALL_FILTER = "all" as const;
type StatusFilter = typeof ALL_FILTER | EventStatus;

// Debounced value hook — keeps the input responsive but defers the work.
function useDebounced<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = React.useState<Event[] | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[] | null>(null);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<StatusFilter>(ALL_FILTER);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const debouncedSearch = useDebounced(search, 200);

  const reload = React.useCallback(async () => {
    const [e, s] = await Promise.all([getAdminEvents(), getAdminSubmissions()]);
    setEvents(e.data);
    setSubmissions(s.data);
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const eventsArr = events ?? [];
  const subsArr = submissions ?? [];

  const filtered = eventsArr.filter((e) => {
    if (filter !== ALL_FILTER && e.status !== filter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !`${e.title} ${e.venue_name} ${e.sub_area}`.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const pendingSubmissions = subsArr.filter((s) => s.review_status === "submitted");
  const archived = eventsArr.filter((e) => e.status === "archived");

  // ── selection helpers ──────────────────────────────────────────────────
  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    setSelected((prev) => {
      if (filtered.every((e) => prev.has(e.id))) return new Set();
      return new Set(filtered.map((e) => e.id));
    });
  };
  const clearSelection = () => setSelected(new Set());

  // ── action handlers ────────────────────────────────────────────────────
  async function setStatus(event: Event, next: EventStatus) {
    const res = await adminSetEventStatus(event.id, next);
    if (res.data) {
      setEvents((prev) =>
        (prev ?? []).map((e) => (e.id === event.id ? { ...e, status: next } : e)),
      );
      toast({
        title: STATUS_TOAST_TITLE[next] ?? "Updated",
        description: event.title,
        variant: next === "published" ? "success" : "default",
      });
    } else {
      toast({
        title: "Could not update status",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function bulkSetStatus(next: EventStatus) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const results = await Promise.all(
      ids.map((id) => adminSetEventStatus(id, next)),
    );
    const ok = results.filter((r) => r.data).length;
    await reload();
    clearSelection();
    toast({
      title: `${ok} of ${ids.length} updated`,
      description: `Set to ${next}`,
      variant: ok === ids.length ? "success" : "default",
    });
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const results = await Promise.all(ids.map((id) => adminDeleteEvent(id)));
    const ok = results.filter((r) => r.data).length;
    await reload();
    clearSelection();
    toast({
      title: `${ok} of ${ids.length} deleted`,
      description: "Removed from the platform.",
      variant: "destructive",
    });
  }

  async function onDelete(event: Event) {
    const res = await adminDeleteEvent(event.id);
    if (res.data) {
      setEvents((prev) => (prev ?? []).filter((e) => e.id !== event.id));
      toast({
        title: "Deleted",
        description: event.title,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Could not delete",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function onReviewSubmission(sub: Submission, review_status: ReviewStatus) {
    const res = await adminSetSubmissionReview(
      sub.id,
      review_status,
      undefined,
      review_status === "approved",
    );
    if (res.data) {
      setSubmissions((prev) =>
        (prev ?? []).map((s) => (s.id === sub.id ? { ...s, review_status } : s)),
      );
      if (review_status === "approved") {
        await reload();
      }
      toast({
        title:
          review_status === "approved"
            ? "Approved"
            : review_status === "rejected"
              ? "Rejected"
              : "Marked as needs info",
        description: sub.title,
        variant: review_status === "approved" ? "success" : "default",
      });
    } else {
      toast({
        title: "Could not update submission",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  return (
    <>
      <AdminSectionHeader
        eyebrow="Operations"
        title="Curation dashboard"
        description={
          events === null
            ? "Loading…"
            : `${events.length} events · ${pendingSubmissions.length} pending submissions`
        }
        actions={
          <>
            <Button asChild variant="outline" size="md">
              <Link href="/admin/analytics">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button asChild variant="primary" size="md">
              <Link href="/admin/events/new">
                <Plus className="h-4 w-4" />
                New event
              </Link>
            </Button>
          </>
        }
      />

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Published"
          value={events === null ? null : eventsArr.filter((e) => e.status === "published").length}
          sub="Live on the site"
        />
        <Stat
          label="Featured"
          value={events === null ? null : eventsArr.filter((e) => e.is_featured).length}
          sub="Curator's picks"
        />
        <Stat
          label="Pending review"
          value={events === null ? null : pendingSubmissions.length}
          sub="Awaiting moderation"
        />
        <Stat
          label="This week"
          value={
            events === null
              ? null
              : eventsArr.filter((e) => e.start_date >= new Date().toISOString().slice(0, 10)).length
          }
          sub="Events within 7 days"
        />
      </div>

      <Tabs defaultValue="events" className="mt-10">
        <TabsList>
          <TabsTrigger value="events">Events ({events === null ? "…" : eventsArr.length})</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({events === null ? "…" : pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="archive">Archive ({events === null ? "…" : archived.length})</TabsTrigger>
        </TabsList>

        {/* EVENTS TAB */}
        <TabsContent value="events">
          <Toolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
          {selected.size > 0 && (
            <BulkBar
              count={selected.size}
              onClear={clearSelection}
              onPublish={() => bulkSetStatus("published")}
              onUnpublish={() => bulkSetStatus("unpublished")}
              onArchive={() => bulkSetStatus("archived")}
              onDelete={bulkDelete}
            />
          )}
          <EventsTable
            loading={events === null}
            rows={filtered}
            selected={selected}
            onToggleRow={toggleSelected}
            onToggleAll={toggleAllVisible}
            allSelected={allVisibleSelected}
            onEdit={(e) => router.push(`/admin/events/${e.slug}`)}
            onSetStatus={setStatus}
            onDelete={onDelete}
          />
        </TabsContent>

        {/* SUBMISSIONS TAB */}
        <TabsContent value="submissions">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              Click any submission to review and approve, request more info, or reject.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/submissions">Open review queue</Link>
            </Button>
          </div>
          <SubmissionsTable
            loading={submissions === null}
            rows={subsArr}
            onApprove={(s) => onReviewSubmission(s, "approved")}
            onReject={(s) => onReviewSubmission(s, "rejected")}
          />
        </TabsContent>

        {/* ARCHIVE TAB */}
        <TabsContent value="archive">
          <ArchiveTable
            loading={events === null}
            rows={archived}
            onRestore={async (e) => {
              const res = await adminSetEventStatus(e.id, "draft");
              if (res.data) {
                setEvents((prev) =>
                  (prev ?? []).map((x) => (x.id === e.id ? { ...x, status: "draft" as EventStatus } : x)),
                );
                toast({ title: "Restored to draft", description: e.title });
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

const STATUS_TOAST_TITLE: Partial<Record<EventStatus, string>> = {
  published: "Published",
  unpublished: "Unpublished",
  archived: "Archived",
  draft: "Restored to draft",
};

// ─────────────────────────────────────────────────────────────
// Toolbar (search + status filters)
// ─────────────────────────────────────────────────────────────
function Toolbar({
  search,
  setSearch,
  filter,
  setFilter,
}: {
  search: string;
  setSearch: (s: string) => void;
  filter: StatusFilter;
  setFilter: (f: StatusFilter) => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        {([ALL_FILTER, ...ALL_EVENT_STATUSES] as const).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === ALL_FILTER ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bulk action bar
// ─────────────────────────────────────────────────────────────
function BulkBar({
  count,
  onClear,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  return (
    <div className="mb-3 flex items-center justify-between rounded-md border border-ember/30 bg-ember-50/40 px-4 py-2.5">
      <div className="text-sm text-ink-700">
        <span className="font-medium">{count}</span> selected
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
        <Button size="sm" variant="outline" onClick={onPublish}>
          <Check className="h-3.5 w-3.5" />
          Publish
        </Button>
        <Button size="sm" variant="outline" onClick={onUnpublish}>
          <EyeOff className="h-3.5 w-3.5" />
          Unpublish
        </Button>
        <Button size="sm" variant="outline" onClick={onArchive}>
          <Archive className="h-3.5 w-3.5" />
          Archive
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {count} events?</DialogTitle>
            <DialogDescription>
              This permanently removes the selected events from the platform. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete {count} events
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Events table — sticky header, row hover, kebab DropdownMenu, checkbox
// ─────────────────────────────────────────────────────────────
function EventsTable({
  loading,
  rows,
  selected,
  onToggleRow,
  onToggleAll,
  allSelected,
  onEdit,
  onSetStatus,
  onDelete,
}: {
  loading: boolean;
  rows: Event[];
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  onEdit: (e: Event) => void;
  onSetStatus: (e: Event, s: EventStatus) => void;
  onDelete: (e: Event) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-paper">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-cream-50 text-left shadow-[inset_0_-1px_0_theme(colors.rule)]">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 eyebrow font-medium">Event</th>
              <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">When</th>
              <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Category</th>
              <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 eyebrow font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-rule">
                  <td colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <Filter className="mx-auto mb-2 h-5 w-5 text-ink-400" />
                  <p className="text-sm font-medium text-ink">No events match those filters.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Try clearing the search or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  isSelected={selected.has(e.id)}
                  onToggle={() => onToggleRow(e.id)}
                  onEdit={() => onEdit(e)}
                  onSetStatus={(s) => onSetStatus(e, s)}
                  onDelete={() => onDelete(e)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventRow({
  event,
  isSelected,
  onToggle,
  onEdit,
  onSetStatus,
  onDelete,
}: {
  event: Event;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSetStatus: (s: EventStatus) => void;
  onDelete: () => void;
}) {
  const catName = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  return (
    <>
      <tr
        className={cn(
          "border-t border-rule transition-colors",
          isSelected ? "bg-ember-50/30" : "hover:bg-cream-50",
        )}
      >
        <td className="px-4 py-3 align-top">
          <Checkbox
            checked={isSelected}
            onChange={onToggle}
            aria-label={`Select ${event.title}`}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-cream-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {event.poster_url && (
                <img
                  src={event.poster_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-ink line-clamp-1">{event.title}</p>
              <p className="text-xs text-ink-500 line-clamp-1">
                {event.venue_name}, {event.sub_area} · {formatPrice(event.price_type, event.price_note)}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-ink-700 whitespace-nowrap">
          {formatEventDate(event.start_date, event.start_time)}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <Badge variant="muted">{catName(event.categories[0] ?? "")}</Badge>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <StatusPill status={event.status} featured={event.is_featured} />
        </td>
        <td className="px-4 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open actions menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{shortTitle(event.title)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview public page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {event.status === "published" ? (
                <DropdownMenuItem onClick={() => onSetStatus("unpublished")}>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onSetStatus("published")}>
                  <Check className="h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {event.status !== "archived" && (
                <DropdownMenuItem onClick={() => onSetStatus("archived")}>
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {event.status === "archived" && (
                <DropdownMenuItem onClick={() => onSetStatus("draft")}>
                  <RotateCcw className="h-4 w-4" />
                  Restore to draft
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="text-ember focus:text-ember"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              This permanently removes &ldquo;{event.title}&rdquo; from the platform. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function shortTitle(t: string): string {
  if (t.length <= 32) return t;
  return t.slice(0, 32) + "…";
}

// ─────────────────────────────────────────────────────────────
// Submissions table
// ─────────────────────────────────────────────────────────────
function SubmissionsTable({
  loading,
  rows,
  onApprove,
  onReject,
}: {
  loading: boolean;
  rows: Submission[];
  onApprove: (s: Submission) => void;
  onReject: (s: Submission) => void;
}) {
  const catName = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-paper">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-cream-50 text-left shadow-[inset_0_-1px_0_theme(colors.rule)]">
            <tr>
              <th className="px-4 py-3 eyebrow font-medium">Submission</th>
              <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">When</th>
              <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">Organizer</th>
              <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Submitted</th>
              <th className="px-4 py-3 eyebrow font-medium hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 eyebrow font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-rule">
                  <td colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-ink">No submissions yet.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    New submissions land here automatically.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-t border-rule hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="font-medium text-ink line-clamp-1 hover:text-accent-700 transition-colors"
                    >
                      {s.title}
                    </Link>
                    <p className="text-xs text-ink-500 line-clamp-1">
                      {s.venue_name}, {s.sub_area} · {catName(s.categories[0] ?? "")}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-700 whitespace-nowrap">
                    {formatEventDate(s.start_date, s.start_time)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-ink-700 line-clamp-1">{s.organizer?.name ?? "Unknown"}</p>
                    <p className="text-xs text-ink-500 line-clamp-1">{s.organizer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-ink-500 text-xs">
                    {relativeTime(s.created_at)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <ReviewPill review_status={s.review_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Open actions menu">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/submissions/${s.id}`}>
                            <Pencil className="h-4 w-4" />
                            Open review
                          </Link>
                        </DropdownMenuItem>
                        {s.review_status !== "approved" && (
                          <DropdownMenuItem onClick={() => onApprove(s)}>
                            <Check className="h-4 w-4 text-accent-700" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {s.review_status !== "rejected" && (
                          <DropdownMenuItem
                            onClick={() => onReject(s)}
                            className="text-ember focus:text-ember"
                          >
                            <Trash2 className="h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Archive table
// ─────────────────────────────────────────────────────────────
function ArchiveTable({
  loading,
  rows,
  onRestore,
}: {
  loading: boolean;
  rows: Event[];
  onRestore: (e: Event) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-paper">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-cream-50 text-left shadow-[inset_0_-1px_0_theme(colors.rule)]">
            <tr>
              <th className="px-4 py-3 eyebrow font-medium">Event</th>
              <th className="px-4 py-3 eyebrow font-medium hidden md:table-cell">When</th>
              <th className="px-4 py-3 eyebrow font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-rule">
                  <td colSpan={3} className="px-4 py-3">
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-16 text-center">
                  <p className="text-sm font-medium text-ink">No archived events.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Archived events land here for later restoration.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id} className="border-t border-rule hover:bg-cream-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{e.title}</p>
                    <p className="text-xs text-ink-500 line-clamp-1">
                      {e.venue_name}, {e.sub_area}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-700 whitespace-nowrap">
                    {formatEventDate(e.start_date, e.start_time)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => onRestore(e)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat tile
// ─────────────────────────────────────────────────────────────
function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | null;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-5">
      <span className="eyebrow">{label}</span>
      <p className="mt-2 font-display text-4xl tracking-tight tabular-nums">
        {value === null ? <span className="text-ink-300">…</span> : value}
      </p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}
