"use client";

import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  CalendarDays,
  MapPin,
  Tag,
  Building2,
  User,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReviewPill } from "@/components/admin/status-pill";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminSubmissions } from "@/lib/api";
import { formatEventDate, relativeTime } from "@/lib/utils";
import { ALL_REVIEW_STATUSES, REVIEW_LABEL } from "@/lib/event-status";
import { CATEGORIES } from "@/lib/categories";
import { AdminSectionHeader } from "@/components/admin/admin-shell";
import type { Submission, ReviewStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | ReviewStatus;

export function SubmissionsList() {
  const [subs, setSubs] = React.useState<Submission[] | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Debounce search so we don't churn on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getAdminSubmissions();
      if (!mounted) return;
      setSubs(res.data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const subsArr = subs ?? [];

  const counts = React.useMemo(() => {
    const c: Record<Filter, number> = {
      all: subsArr.length,
      submitted: 0,
      approved: 0,
      rejected: 0,
      needs_info: 0,
    };
    for (const s of subsArr) c[s.review_status] += 1;
    return c;
  }, [subsArr]);

  const filtered = subsArr.filter((s) => {
    if (filter !== "all" && s.review_status !== filter) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !`${s.title} ${s.organizer?.name ?? ""} ${s.sub_area ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
    }
    return true;
  });

  // Auto-select first item when filter/search changes.
  React.useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filtered.some((s) => s.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = subsArr.find((s) => s.id === selectedId) ?? null;

  return (
    <>
      <AdminSectionHeader
        eyebrow="Submissions"
        title="Review queue"
        description="Organizers submit events here. Approve, request more info, or reject."
      />

      {/* Status filter chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={counts.all}>
          All
        </FilterChip>
        {ALL_REVIEW_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={filter === s}
            onClick={() => setFilter(s)}
            count={counts[s]}
          >
            {s === "submitted"
              ? "New"
              : s === "needs_info"
                ? "Needs info"
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </FilterChip>
        ))}
      </div>

      {/* Split-pane */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left list */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="rounded-lg border border-rule bg-paper">
            <div className="border-b border-rule p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  placeholder="Search submissions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ul className="max-h-[70vh] divide-y divide-rule overflow-y-auto">
              {subs === null ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </li>
                ))
              ) : filtered.length === 0 ? (
                <li className="p-12 text-center">
                  <Inbox className="mx-auto mb-3 h-6 w-6 text-ink-400" />
                  <p className="text-sm font-medium text-ink">No submissions.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {filter === "all"
                      ? "New submissions will land here."
                      : `Nothing in ${REVIEW_LABEL[filter as ReviewStatus]}.`}
                  </p>
                </li>
              ) : (
                filtered.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        "block w-full p-4 text-left transition-colors",
                        selectedId === s.id
                          ? "bg-cream-100"
                          : "hover:bg-cream-50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <ReviewPill review_status={s.review_status} />
                            <span className="text-[0.65rem] text-ink-500">
                              {relativeTime(s.created_at)}
                            </span>
                          </div>
                          <h3 className="mt-2 truncate font-display text-base font-medium tracking-tight text-ink">
                            {s.title}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-ink-500">
                            {s.venue_name} · {s.sub_area}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "mt-1 h-4 w-4 shrink-0 transition-colors",
                            selectedId === s.id ? "text-ink" : "text-ink-400",
                          )}
                        />
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Right preview */}
        <div className="lg:col-span-7 xl:col-span-8">
          {selected ? (
            <SubmissionPreview key={selected.id} submission={selected} />
          ) : subs === null ? (
            <Card className="p-12 text-center">
              <Skeleton className="mx-auto h-32 w-32 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-4 w-48" />
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Inbox className="mx-auto h-6 w-6 text-ink-400" />
              <p className="mt-3 text-sm font-medium text-ink">Select a submission</p>
              <p className="mt-1 text-xs text-ink-500">
                Choose one from the list to review details.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function SubmissionPreview({ submission }: { submission: Submission }) {
  const catName = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <div className="rounded-lg border border-rule bg-paper">
      {/* Header */}
      <div className="border-b border-rule p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ReviewPill review_status={submission.review_status} />
              <span className="text-[0.65rem] text-ink-500">
                Submitted {relativeTime(submission.created_at)}
              </span>
              {submission.wants_promotion_support && (
                <Badge variant="outline" className="font-mono text-[0.6rem]">
                  <Sparkles className="mr-1 inline h-2.5 w-2.5" />
                  Wants promo
                </Badge>
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight text-ink">
              {submission.title}
            </h2>
            <p className="mt-2 text-sm text-ink-500">{catName(submission.categories[0] ?? "")}</p>
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href={`/admin/submissions/${submission.id}`}>
              Open full review
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">
        <p className="whitespace-pre-line text-sm text-ink-700 leading-relaxed">
          {submission.description}
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailItem icon={CalendarDays} label="When">
            {formatEventDate(submission.start_date, submission.start_time)}
            {submission.end_date && (
              <span className="text-ink-400">
                {" "}→ {formatEventDate(submission.end_date)}
              </span>
            )}
          </DetailItem>
          <DetailItem icon={MapPin} label="Where">
            {submission.venue_name}
            <br />
            <span className="text-ink-500">{submission.area_details}</span>
          </DetailItem>
          <DetailItem icon={User} label="Organizer">
            {submission.organizer?.name || "Unknown organizer"}
            {submission.organizer?.phone && (
              <span className="block text-xs text-ink-500">
                <Phone className="mr-1 inline h-3 w-3" />
                {submission.organizer.phone}
              </span>
            )}
            {submission.organizer?.email && (
              <span className="block text-xs text-ink-500">
                <Mail className="mr-1 inline h-3 w-3" />
                {submission.organizer.email}
              </span>
            )}
            {submission.organizer?.social_link && (
              <span className="block text-xs text-ink-500">
                <Instagram className="mr-1 inline h-3 w-3" />
                social link
              </span>
            )}
          </DetailItem>
          <DetailItem icon={Tag} label="Categories">
            <div className="flex flex-wrap gap-1.5">
              {submission.categories.map((c) => (
                <Badge key={c} variant="muted">
                  {catName(c)}
                </Badge>
              ))}
            </div>
          </DetailItem>
        </div>

        {submission.additional_notes && (
          <div className="rounded-md border border-rule bg-cream-50 p-4">
            <span className="eyebrow text-ink-700">Organizer note</span>
            <p className="mt-2 text-sm text-ink-700">{submission.additional_notes}</p>
          </div>
        )}

        {submission.review_status === "needs_info" && (
          <div className="flex items-start gap-3 rounded-md border border-ember-200 bg-ember-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ember-700" />
            <p className="text-xs text-ember-700">
              This submission is awaiting more info from the organizer. Review and decide next steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm text-ink-700">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? "primary" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      {children}
      {typeof count === "number" && (
        <span className={active ? "text-paper/70" : "text-ink-400"}>{count}</span>
      )}
    </Button>
  );
}

// Suppress unused import warning (Building2 may be reused in future iterations).
void Building2;
