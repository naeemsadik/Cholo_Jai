"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  HelpCircle,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  MapPin,
  Loader2,
  Calendar,
  Users,
  Megaphone,
  Clock,
  History,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewPill } from "@/components/admin/status-pill";
import { toast } from "@/components/ui/toaster";
import {
  adminGetSubmissionById,
  adminSetSubmissionReview,
} from "@/lib/api";
import { formatEventDate, formatPrice, relativeTime } from "@/lib/utils";
import { CATEGORIES, AUDIENCE_TAGS } from "@/lib/categories";
import { REVIEW_LABEL, type StatusTone } from "@/lib/event-status";
import type { Submission, ReviewStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SubmissionReview({ id }: { id: string }) {
  const router = useRouter();
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState(false);
  const [chosenStatus, setChosenStatus] = React.useState<ReviewStatus>("approved");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminGetSubmissionById(id);
      if (!mounted) return;
      setSubmission(res.data);
      if (res.data) {
        setChosenStatus(
          res.data.review_status === "submitted" ? "approved" : res.data.review_status,
        );
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function apply(status: ReviewStatus) {
    if (!submission) return;
    setActing(true);
    const res = await adminSetSubmissionReview(submission.id, status, note || undefined);
    setActing(false);
    if (res.data) {
      toast({
        title:
          status === "approved"
            ? "Approved"
            : status === "rejected"
            ? "Rejected"
            : "Marked as needs info",
        description: submission.title,
        variant: status === "approved" ? "success" : "default",
      });
      router.push("/admin/submissions");
    } else {
      toast({
        title: "Could not update",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading submission…
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="rounded-lg border border-rule bg-paper p-8 text-center">
        <p className="text-sm text-ink-500">This submission can&rsquo;t be found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/submissions">
            <ArrowLeft className="h-4 w-4" />
            Back to review queue
          </Link>
        </Button>
      </div>
    );
  }

  const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  const tagName = (slug: string) => AUDIENCE_TAGS.find((t) => t.slug === slug)?.name ?? slug;

  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-8">
      {/* Top bar */}
      <div className="md:col-span-12 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/submissions">
            <ArrowLeft className="h-4 w-4" />
            Review queue
          </Link>
        </Button>
        <ReviewPill review_status={submission.review_status} />
      </div>

      {/* Left summary */}
      <div className="md:col-span-4 space-y-4">
        <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
          <span className="eyebrow">Event</span>
          <h1 className="mt-3 font-display text-2xl leading-tight tracking-tight text-ink">
            {submission.title}
          </h1>
          <div className="mt-4 space-y-2 text-sm">
            <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Venue">
              {submission.venue_name}
            </Row>
            <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Area">
              {submission.area_details}, {submission.sub_area}
            </Row>
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="When">
              {formatEventDate(submission.start_date, submission.start_time)}
              {submission.end_time ? ` — ${submission.end_time}` : ""}
            </Row>
            <Row icon={<Users className="h-3.5 w-3.5" />} label="Expected">
              {submission.expected_attendance ?? "—"}
            </Row>
            <Row icon={<Megaphone className="h-3.5 w-3.5" />} label="Cost">
              <span className="font-mono uppercase tracking-wider">
                {formatPrice(submission.price_type, submission.price_note)}
              </span>
            </Row>
          </div>

          {submission.maps_link && (
            <a
              href={submission.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs text-ink hover:text-accent-700 transition-colors"
            >
              Open in Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <Separator className="my-5" />

          <span className="eyebrow">Organizer</span>
          <p className="mt-2 font-display text-lg text-ink">
            {submission.organizer?.name || "Unknown organizer"}
          </p>
          <div className="mt-3 space-y-1.5 text-sm text-ink-700">
            {submission.organizer?.phone && (
              <a href={`tel:${submission.organizer.phone}`} className="flex items-center gap-2 hover:text-accent-700 transition-colors">
                <Phone className="h-3.5 w-3.5 text-ink-400" />
                {submission.organizer.phone}
              </a>
            )}
            {submission.organizer?.email && (
              <a href={`mailto:${submission.organizer.email}`} className="flex items-center gap-2 hover:text-accent-700 transition-colors">
                <Mail className="h-3.5 w-3.5 text-ink-400" />
                {submission.organizer.email}
              </a>
            )}
            {submission.organizer?.social_link && (
              <a
                href={submission.organizer.social_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent-700 transition-colors"
              >
                <Instagram className="h-3.5 w-3.5 text-ink-400" />
                social link
              </a>
            )}
          </div>

          <Separator className="my-5" />

          <span className="eyebrow">Submitted</span>
          <p className="mt-2 text-sm text-ink-700">{relativeTime(submission.created_at)}</p>
          {submission.wants_promotion_support && (
            <Badge variant="outline" className="mt-3 font-mono text-[0.6rem]">
              Wants promotion support
            </Badge>
          )}
        </div>

        <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
          <span className="eyebrow">Outbound link</span>
          <a
            href={submission.outbound_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-accent-700 hover:text-ink transition-colors break-all"
          >
            {submission.outbound_link}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Middle description */}
      <div className="md:col-span-4">
        <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
          <span className="eyebrow">Description</span>
          <div className="mt-4 space-y-3 font-display text-base leading-relaxed text-ink">
            {submission.description.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <Separator className="my-5" />

          <span className="eyebrow">Categories</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {submission.categories.map((c) => (
              <Badge key={c} variant="muted">
                {catName(c)}
              </Badge>
            ))}
          </div>

          {submission.audience_tags && submission.audience_tags.length > 0 && (
            <>
              <Separator className="my-5" />
              <span className="eyebrow">Audience</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {submission.audience_tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {tagName(t)}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {submission.additional_notes && (
            <>
              <Separator className="my-5" />
              <span className="eyebrow">Notes from organizer</span>
              <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                {submission.additional_notes}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right review panel */}
      <div className="md:col-span-4">
        <div className="md:sticky md:top-32 rounded-lg border border-rule bg-paper p-5 shadow-paper">
          <span className="eyebrow">Decision</span>

          <div className="mt-3 space-y-2">
            <ReviewRadio
              status="approved"
              selected={chosenStatus}
              onSelect={setChosenStatus}
              label={REVIEW_LABEL.approved}
              hint="Publishes to the live site (creates an Event from this submission)."
              tone="accent"
              icon={<Check className="h-4 w-4" />}
            />
            <ReviewRadio
              status="needs_info"
              selected={chosenStatus}
              onSelect={setChosenStatus}
              label={REVIEW_LABEL.needs_info}
              hint="Asks the organizer for more information. No notification channel in MVP — reach them by phone."
              tone="muted"
              icon={<HelpCircle className="h-4 w-4" />}
            />
            <ReviewRadio
              status="rejected"
              selected={chosenStatus}
              onSelect={setChosenStatus}
              label={REVIEW_LABEL.rejected}
              hint="Removes from the queue. Use for spam, unclear organizers, or off-brand events."
              tone="ember"
              icon={<X className="h-4 w-4" />}
            />
          </div>

          <div className="mt-5">
            <Label className="mb-1.5 inline-block">Note for the queue</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Optional context for next time you look at this…"
            />
          </div>

          <div className="mt-5 grid gap-2">
            <Button
              variant="primary"
              disabled={acting}
              onClick={() => apply(chosenStatus)}
              className="w-full"
            >
              {acting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : chosenStatus === "approved" ? (
                <Check className="h-4 w-4" />
              ) : chosenStatus === "needs_info" ? (
                <HelpCircle className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Apply · {REVIEW_LABEL[chosenStatus]}
            </Button>
          </div>

          <p className="mt-3 text-[0.65rem] text-ink-400 font-mono uppercase tracking-wider">
            Per PRD §7.6 · Approve creates a published Event
          </p>

          {/* Approved → jump to the resulting event */}
          {submission.review_status === "approved" && (
            <div className="mt-4 rounded-md border border-accent-200 bg-accent-50 p-3">
              <p className="text-xs text-accent-700">
                Approved · this submission is now a published Event.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link href={`/admin/events?source=${submission.id}`}>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Find resulting event
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom — audit trail */}
      <div className="md:col-span-12">
        <div className="rounded-lg border border-rule bg-paper p-5 shadow-paper">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-ink-400" />
            <span className="eyebrow">Audit trail</span>
          </div>
          <ul className="mt-4 space-y-3">
            <AuditRow
              icon={Calendar}
              label="Submitted"
              detail={`${relativeTime(submission.created_at)} · ${formatEventDate(submission.created_at.slice(0, 10))}`}
            />
            {submission.updated_at !== submission.created_at && (
              <AuditRow
                icon={Clock}
                label="Last updated"
                detail={`${relativeTime(submission.updated_at)} · ${formatEventDate(submission.updated_at.slice(0, 10))}`}
              />
            )}
            <AuditRow
              icon={ReviewStatusIcon(submission.review_status)}
              label="Current state"
              detail={REVIEW_LABEL[submission.review_status]}
              tone={submission.review_status === "approved" ? "accent" : submission.review_status === "rejected" ? "ember" : "muted"}
            />
            {submission.reviewed_by && (
              <AuditRow
                icon={Users}
                label="Reviewed by"
                detail={submission.reviewed_by}
              />
            )}
            {submission.additional_notes && (
              <li className="rounded-md border border-rule bg-cream-50 p-3">
                <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
                  Last admin note
                </span>
                <p className="mt-1 text-sm text-ink-700">{submission.additional_notes}</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AuditRow({
  icon: Icon,
  label,
  detail,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  tone?: "accent" | "ember" | "muted";
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          tone === "accent" && "bg-accent-100 text-accent-700",
          tone === "ember" && "bg-ember-100 text-ember-700",
          (!tone || tone === "muted") && "bg-cream-200 text-ink-700",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[0.65rem] font-mono uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <p className="text-sm text-ink">{detail}</p>
      </div>
    </li>
  );
}

function ReviewStatusIcon(s: ReviewStatus) {
  if (s === "approved") return Check;
  if (s === "rejected") return X;
  if (s === "needs_info") return HelpCircle;
  return Calendar;
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-ink-400">{icon}</span>
      <span className="min-w-[68px] text-xs font-mono uppercase tracking-wider text-ink-500">
        {label}
      </span>
      <span className="text-ink-700 flex-1">{children}</span>
    </div>
  );
}

function ReviewRadio({
  status,
  selected,
  onSelect,
  label,
  hint,
  tone,
  icon,
}: {
  status: ReviewStatus;
  selected: ReviewStatus;
  onSelect: (s: ReviewStatus) => void;
  label: string;
  hint: string;
  tone: StatusTone;
  icon: React.ReactNode;
}) {
  const active = selected === status;
  const accentCls: Record<StatusTone, string> = {
    accent: "border-accent bg-accent-50",
    ember: "border-ember bg-ember-50",
    ink: "border-ink bg-ink text-paper",
    muted: "border-ink-300 bg-paper",
    outline: "border-rule bg-paper",
  };
  return (
    <button
      type="button"
      onClick={() => onSelect(status)}
      className={cn(
        "block w-full rounded-lg border p-3 text-left transition-all",
        active ? accentCls[tone] : "border-rule bg-paper hover:border-ink-300",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            active && tone === "accent" ? "bg-accent text-paper" :
            active && tone === "ember" ? "bg-ember text-paper" :
            "bg-cream-200 text-ink-700",
          )}
        >
          {icon}
        </span>
        <span className={cn("text-sm font-medium", active && tone === "ink" ? "text-paper" : "text-ink")}>
          {label}
        </span>
      </div>
      <p className={cn("mt-1.5 text-xs leading-snug", active && tone === "ink" ? "text-paper/70" : "text-ink-500")}>
        {hint}
      </p>
    </button>
  );
}
