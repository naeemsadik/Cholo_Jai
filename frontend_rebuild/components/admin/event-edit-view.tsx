"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  Loader2,
  Check,
  CircleDot,
  Sparkles,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPill } from "@/components/admin/status-pill";
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
  getAdminEvents,
  adminGetEventById,
  adminUpdateEvent,
  adminSetEventStatus,
  adminDeleteEvent,
} from "@/lib/api";
import { formatEventDate, relativeTime } from "@/lib/utils";
import {
  STATUS_LABEL,
  STATUS_TRANSITIONS,
  ALL_EVENT_STATUSES,
} from "@/lib/event-status";
import {
  CATEGORIES,
  AUDIENCE_TAGS,
  SUB_AREAS,
  OUTBOUND_BUTTON_LABELS,
} from "@/lib/categories";
import type { Event, EventStatus, OutboundButtonLabel, PriceType } from "@/lib/types";
import { cn } from "@/lib/utils";

type SaveState = "saved" | "saving" | "dirty" | "error";

const AUTOSAVE_DELAY_MS = 1500;

export function EventEditView({ slug }: { slug: string }) {
  const router = useRouter();
  const [event, setEvent] = React.useState<Event | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<Partial<Event>>({});
  const [saveState, setSaveState] = React.useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Track initial load
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await getAdminEvents();
      const found = all.data.find((e) => e.slug === slug);
      if (!found) {
        if (mounted) {
          setLoading(false);
          toast({
            title: "Event not found",
            description: `No event matches slug "${slug}".`,
            variant: "destructive",
          });
        }
        return;
      }
      const detail = await adminGetEventById(found.id);
      if (mounted && detail.data) {
        setEvent(detail.data);
        setDraft(detail.data);
        setLastSavedAt(detail.data.updated_at);
        setSaveState("saved");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // Patch helper
  const patch = React.useCallback(<K extends keyof Event>(key: K, value: Event[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaveState("dirty");
  }, []);

  // Auto-save loop — fires AUTOSAVE_DELAY_MS after the last change.
  React.useEffect(() => {
    if (saveState !== "dirty" || !event) return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      const res = await adminUpdateEvent(event.id, draft);
      if (res.data) {
        setEvent(res.data);
        setDraft(res.data);
        setLastSavedAt(res.data.updated_at);
        setSaveState("saved");
      } else {
        setSaveState("error");
        toast({
          title: "Auto-save failed",
          description: res.error ?? "Please retry or refresh.",
          variant: "destructive",
        });
      }
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [saveState, draft, event]);

  async function manualSave() {
    if (!event || saveState === "saving") return;
    setSaveState("saving");
    const res = await adminUpdateEvent(event.id, draft);
    if (res.data) {
      setEvent(res.data);
      setDraft(res.data);
      setLastSavedAt(res.data.updated_at);
      setSaveState("saved");
      toast({ title: "Saved", description: res.data.title, variant: "success" });
    } else {
      setSaveState("error");
      toast({
        title: "Could not save",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function changeStatus(status: EventStatus) {
    if (!event) return;
    const res = await adminSetEventStatus(event.id, status);
    if (res.data) {
      setEvent(res.data);
      setDraft((prev) => ({ ...prev, status }));
      setLastSavedAt(res.data.updated_at);
      toast({ title: "Status updated", description: `${STATUS_LABEL[status]} · ${event.title}` });
    } else {
      toast({
        title: "Could not update status",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function toggleFeatured() {
    if (!event) return;
    const next = !event.is_featured;
    const res = await adminUpdateEvent(event.id, { is_featured: next });
    if (res.data) {
      setEvent(res.data);
      setDraft((prev) => ({ ...prev, is_featured: next }));
      setLastSavedAt(res.data.updated_at);
      toast({
        title: next ? "Marked as featured" : "Removed from featured",
        description: event.title,
      });
    }
  }

  async function toggleHero() {
    if (!event) return;
    const next = !event.show_in_hero;
    const res = await adminUpdateEvent(event.id, { show_in_hero: next });
    if (res.data) {
      setEvent(res.data);
      setDraft((prev) => ({ ...prev, show_in_hero: next }));
      setLastSavedAt(res.data.updated_at);
      toast({
        title: next ? "Added to homepage carousel" : "Removed from homepage carousel",
        description: event.title,
      });
    }
  }

  async function deleteEvent() {
    if (!event) return;
    const res = await adminDeleteEvent(event.id);
    if (res.data) {
      toast({
        title: "Deleted",
        description: event.title,
        variant: "destructive",
      });
      router.push("/admin/events");
    } else {
      toast({
        title: "Could not delete",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading event…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-lg border border-rule bg-paper p-8 text-center">
        <p className="text-sm text-ink-500">
          This event can&rsquo;t be found. It may have been removed.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </Button>
      </div>
    );
  }

  const d = { ...event, ...draft };

  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-8">
      {/* Main column */}
      <div className="md:col-span-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              All events
            </Link>
          </Button>
          <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} onManualSave={manualSave} />
        </div>

        {/* Title (editable) */}
        <input
          aria-label="Event title"
          value={d.title ?? ""}
          onChange={(e) => patch("title", e.target.value)}
          placeholder="Event title"
          className="w-full bg-transparent font-display text-display-sm tracking-tight text-ink placeholder:text-ink-300 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500">
          <StatusPill status={d.status ?? event.status} featured={d.is_featured ?? event.is_featured} />
          <span>·</span>
          <span>{formatEventDate(d.start_date ?? event.start_date, d.start_time ?? event.start_time)}</span>
          <span>·</span>
          <span>{d.venue_name ?? event.venue_name}</span>
        </div>

        <Tabs defaultValue="details" className="mt-8">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details">
            <div className="space-y-5">
              <Field label="Description">
                <Textarea
                  value={d.description ?? ""}
                  onChange={(e) => patch("description", e.target.value)}
                  rows={8}
                />
              </Field>
              <Field label="Poster URL" hint="Hosted URL · uploads post-MVP">
                <Input
                  value={d.poster_url ?? ""}
                  onChange={(e) => patch("poster_url", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Categories" hint="One or more">
                <MultiSelect
                  options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
                  selected={d.categories ?? []}
                  onChange={(v) => patch("categories", v)}
                />
              </Field>
              <Field label="Audience tags" hint="Optional">
                <MultiSelect
                  options={AUDIENCE_TAGS.map((t) => ({ value: t.slug, label: t.name }))}
                  selected={d.audience_tags ?? []}
                  onChange={(v) => patch("audience_tags", v)}
                />
              </Field>

              <Separator />

              <h3 className="font-display text-lg tracking-tight">Organizer</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={d.organizer?.name ?? ""}
                    onChange={(e) =>
                      patch("organizer", { ...(d.organizer ?? { name: "" }), name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={d.organizer?.phone ?? ""}
                    onChange={(e) =>
                      patch("organizer", {
                        ...(d.organizer ?? { name: "" }),
                        phone: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={d.organizer?.email ?? ""}
                    onChange={(e) =>
                      patch("organizer", {
                        ...(d.organizer ?? { name: "" }),
                        email: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Social link">
                  <Input
                    value={d.organizer?.social_link ?? ""}
                    onChange={(e) =>
                      patch("organizer", {
                        ...(d.organizer ?? { name: "" }),
                        social_link: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <Checkbox
                  label="Mark as recommended"
                  checked={!!d.is_recommended}
                  onChange={(e) => patch("is_recommended", e.target.checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* SCHEDULE */}
          <TabsContent value="schedule">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Start date">
                  <Input
                    type="date"
                    value={d.start_date ?? ""}
                    onChange={(e) => patch("start_date", e.target.value)}
                  />
                </Field>
                <Field label="Start time">
                  <Input
                    type="time"
                    value={d.start_time ?? ""}
                    onChange={(e) => patch("start_time", e.target.value)}
                  />
                </Field>
                <Field label="End date" hint="Optional">
                  <Input
                    type="date"
                    value={d.end_date ?? ""}
                    onChange={(e) => patch("end_date", e.target.value || null)}
                  />
                </Field>
                <Field label="End time" hint="Optional">
                  <Input
                    type="time"
                    value={d.end_time ?? ""}
                    onChange={(e) => patch("end_time", e.target.value || null)}
                  />
                </Field>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Venue name">
                  <Input
                    value={d.venue_name ?? ""}
                    onChange={(e) => patch("venue_name", e.target.value)}
                  />
                </Field>
                <Field label="City" hint="Locked to Dhaka for MVP">
                  <Input value={d.city ?? "Dhaka"} readOnly className="bg-cream-100 text-ink-500" />
                </Field>
                <Field label="Sub-area">
                  <Select value={d.sub_area ?? ""} onValueChange={(v) => patch("sub_area", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUB_AREAS.map((s) => (
                        <SelectItem key={s.slug} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Google Maps link" hint="Optional">
                  <Input
                    value={d.maps_link ?? ""}
                    onChange={(e) => patch("maps_link", e.target.value)}
                    placeholder="https://maps.google.com/?q=…"
                  />
                </Field>
              </div>

              <Field label="Area / location details">
                <Textarea
                  value={d.area_details ?? ""}
                  onChange={(e) => patch("area_details", e.target.value)}
                  rows={3}
                />
              </Field>
            </div>
          </TabsContent>

          {/* OUTBOUND */}
          <TabsContent value="outbound">
            <div className="space-y-5">
              <Field label="Outbound link" hint="Where the CTA sends users">
                <Input
                  value={d.outbound_link ?? ""}
                  onChange={(e) => patch("outbound_link", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Outbound button label">
                <Select
                  value={d.outbound_button_label ?? "Register"}
                  onValueChange={(v) => patch("outbound_button_label", v as OutboundButtonLabel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTBOUND_BUTTON_LABELS.map((label) => (
                      <SelectItem key={label.value} value={label.value}>
                        {label.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Price type">
                  <Select
                    value={d.price_type ?? "free"}
                    onValueChange={(v) => patch("price_type", v as PriceType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Price note" hint="Shown if paid">
                  <Input
                    value={d.price_note ?? ""}
                    onChange={(e) => patch("price_note", e.target.value)}
                    placeholder="৳500 per person"
                  />
                </Field>
              </div>

              <Field label="Expected attendance" hint="Optional · planning only">
                <Input
                  type="number"
                  min={0}
                  value={d.expected_attendance ?? ""}
                  onChange={(e) =>
                    patch("expected_attendance", e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                />
              </Field>
            </div>
          </TabsContent>

          {/* NOTES */}
          <TabsContent value="notes">
            <div className="space-y-5">
              <Field label="Admin notes" hint="Internal only · never displayed publicly">
                <Textarea
                  value={d.admin_notes ?? ""}
                  onChange={(e) => patch("admin_notes", e.target.value)}
                  rows={6}
                  placeholder="Anything internal — sourcing context, organizer history, edits made…"
                />
              </Field>
              <Field label="Source link" hint="Internal only · IG post, FB link, etc.">
                <Input
                  value={d.source_link ?? ""}
                  onChange={(e) => patch("source_link", e.target.value)}
                  placeholder="https://instagram.com/p/…"
                />
              </Field>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right rail */}
      <aside className="md:col-span-4">
        <div className="md:sticky md:top-32 space-y-4">
          <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
            <span className="eyebrow">Status</span>
            <Select
              value={d.status ?? event.status}
              onValueChange={(v) => changeStatus(v as EventStatus)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_EVENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-ink-500">
              Suggested next:{" "}
              {STATUS_TRANSITIONS[event.status]?.[0]
                ? STATUS_LABEL[STATUS_TRANSITIONS[event.status][0]]
                : "—"}
            </p>
          </div>

          <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
            <span className="eyebrow">Featured</span>
            <div className="mt-3">
              <Checkbox
                label="Featured on homepage"
                checked={!!d.is_featured}
                onChange={() => toggleFeatured()}
              />
            </div>
            <p className="mt-2 text-xs text-ink-500">
              Highlight in the Editor&rsquo;s pick section. Saved immediately.
            </p>
          </div>

          <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
            <span className="eyebrow">Hero carousel</span>
            <div className="mt-3">
              <Checkbox
                label="Show in homepage hero"
                checked={!!d.show_in_hero}
                onChange={() => toggleHero()}
              />
            </div>
            <p className="mt-2 text-xs text-ink-500">
              Rotating slide at the top of the homepage. Saved immediately.
            </p>
          </div>

          <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
            <span className="eyebrow">Quick links</span>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link
                href={`/events/${event.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-ink hover:text-accent-700 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                View public page
              </Link>
              <p className="text-xs text-ink-500">
                Created {formatEventDate(event.created_at.slice(0, 10))} · Updated{" "}
                {formatEventDate(event.updated_at.slice(0, 10))}
              </p>
              <p className="text-xs text-ink-400 font-mono">/{event.slug}</p>
            </div>
          </div>

          <div className="rounded-lg border border-ember-200 bg-ember-50 p-5">
            <span className="eyebrow text-ember-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Danger zone
            </span>
            <p className="mt-2 text-xs text-ember-700">
              Permanently removes this event. Cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete event
            </Button>
          </div>
        </div>
      </aside>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              &ldquo;{event.title}&rdquo; will be removed permanently. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteEvent}>
              <Trash2 className="h-4 w-4" />
              Delete event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <Label className="text-xs font-mono uppercase tracking-wider text-ink-500">
          {label}
        </Label>
        {hint && <span className="text-[0.65rem] text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveIndicator({
  state,
  lastSavedAt,
  onManualSave,
}: {
  state: SaveState;
  lastSavedAt: string | null;
  onManualSave: () => void;
}) {
  let icon: React.ReactNode = null;
  let label = "";
  let tone = "text-ink-500";
  switch (state) {
    case "saved":
      icon = <Check className="h-3.5 w-3.5 text-accent-700" />;
      label = lastSavedAt ? `Saved ${relativeTime(lastSavedAt)}` : "Saved";
      tone = "text-ink-500";
      break;
    case "saving":
      icon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      label = "Saving…";
      break;
    case "dirty":
      icon = <CircleDot className="h-3.5 w-3.5 text-ember-600" />;
      label = "Unsaved changes · auto-save in a moment";
      tone = "text-ember-700";
      break;
    case "error":
      icon = <AlertTriangle className="h-3.5 w-3.5 text-ember" />;
      label = "Save failed — retry?";
      tone = "text-ember";
      break;
  }
  return (
    <button
      type="button"
      onClick={state === "error" ? onManualSave : undefined}
      disabled={state === "saving" || state === "saved"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors",
        state === "error" && "hover:bg-ember-50",
        tone,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all " +
              (active
                ? "border-ink bg-ink text-paper"
                : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Suppress lint warning for unused imports when this file gets refactored.
void ChevronDown;
void Sparkles;