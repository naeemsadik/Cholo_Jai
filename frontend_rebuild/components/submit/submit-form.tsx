"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  LinkIcon,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SelectChip } from "@/components/ui/badge-chip";
import { toast } from "@/components/ui/toaster";
import { submitEvent } from "@/lib/api";
import { CATEGORIES, AUDIENCE_TAGS, SUB_AREAS_DHAKA } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface FormState {
  // Organizer
  organizer_name: string;
  organizer_phone: string;
  organizer_email: string;
  organizer_social_link: string;
  // Event
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  venue_name: string;
  area_details: string;
  city: string;
  sub_area: string;
  maps_link: string;
  categories: string[];
  audience_tags: string[];
  price_type: "free" | "paid";
  price_note: string;
  outbound_link: string;
  expected_attendance: string;
  poster_url: string;
  wants_promotion_support: boolean;
  additional_notes: string;
}

const INITIAL: FormState = {
  organizer_name: "",
  organizer_phone: "",
  organizer_email: "",
  organizer_social_link: "",
  title: "",
  description: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  venue_name: "",
  area_details: "",
  city: "Dhaka",
  sub_area: "",
  maps_link: "",
  categories: [],
  audience_tags: [],
  price_type: "free",
  price_note: "",
  outbound_link: "",
  expected_attendance: "",
  poster_url: "",
  wants_promotion_support: false,
  additional_notes: "",
};

const STEPS = [
  { id: 1, title: "About you", description: "Tell us who's organizing" },
  { id: 2, title: "About the event", description: "Title, date, venue" },
  { id: 3, title: "Details", description: "Categories, cost, links" },
  { id: 4, title: "Review", description: "Check & submit" },
];

export function SubmitForm() {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function toggleArrayValue<K extends "categories" | "audience_tags">(key: K, value: string) {
    setForm((f) => {
      const arr = f[key];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...f, [key]: next };
    });
  }

  function validateStep(s: number): boolean {
    const err: typeof errors = {};
    if (s === 1) {
      if (!form.organizer_name.trim()) err.organizer_name = "Required";
      if (!form.organizer_phone.trim()) err.organizer_phone = "Required";
      if (form.organizer_email && !/^\S+@\S+\.\S+$/.test(form.organizer_email)) {
        err.organizer_email = "Looks invalid";
      }
    }
    if (s === 2) {
      if (!form.title.trim()) err.title = "Required";
      if (form.title.trim().length > 0 && form.title.trim().length < 6) err.title = "A bit more please";
      if (!form.description.trim() || form.description.trim().length < 30) err.description = "At least 30 characters";
      if (!form.start_date) err.start_date = "Required";
      if (!form.start_time) err.start_time = "Required";
      if (!form.venue_name.trim()) err.venue_name = "Required";
      if (!form.area_details.trim()) err.area_details = "Required";
      if (!form.sub_area) err.sub_area = "Required";
    }
    if (s === 3) {
      if (form.categories.length === 0) err.categories = "Pick at least one";
      if (form.price_type === "paid" && !form.price_note.trim()) err.price_note = "Add a price";
      if (!form.outbound_link.trim()) err.outbound_link = "Required";
      try {
        if (form.outbound_link && !/^https?:\/\//.test(form.outbound_link)) {
          err.outbound_link = "Use a full URL (https://…)";
        }
      } catch { /* ignore */ }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function onSubmit() {
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    const res = await submitEvent({
      title: form.title,
      description: form.description,
      start_date: form.start_date,
      start_time: form.start_time,
      end_date: form.end_date || undefined,
      end_time: form.end_time || undefined,
      city: form.city,
      sub_area: form.sub_area,
      venue_name: form.venue_name,
      area_details: form.area_details,
      maps_link: form.maps_link || undefined,
      categories: form.categories,
      audience_tags: form.audience_tags,
      price_type: form.price_type,
      price_note: form.price_type === "paid" ? form.price_note : undefined,
      organizer_name: form.organizer_name,
      organizer_phone: form.organizer_phone,
      organizer_email: form.organizer_email || undefined,
      organizer_social_link: form.organizer_social_link || undefined,
      outbound_link: form.outbound_link,
      expected_attendance: form.expected_attendance ? Number(form.expected_attendance) : undefined,
      wants_promotion_support: form.wants_promotion_support,
      additional_notes: form.additional_notes || undefined,
    });
    setSubmitting(false);
    if (res.data) {
      setDone(true);
      toast({
        title: "Submission received",
        description: res.source === "fallback"
          ? "Heads up: backend is offline. Your submission wasn't saved — please retry once the API is up."
          : "We'll review it within 48 hours.",
        variant: res.source === "fallback" ? "destructive" : "success",
      });
    } else {
      toast({ title: "Could not submit", description: res.error || "Try again later.", variant: "destructive" });
    }
  }

  if (done) {
    return <SuccessState isFallback={form.title.length > 0 /* placeholder */} />;
  }

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      {/* Left rail — step indicator */}
      <aside className="md:col-span-4">
        <div className="sticky top-24">
          <span className="eyebrow">Submit an event</span>
          <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-balance md:text-4xl">
            Tell us about your event.
          </h1>
          <p className="mt-4 text-sm text-ink-500 leading-relaxed">
            We read every submission. If it's a fit for our editorial, we'll publish it
            within 48 hours. The form takes about 5 minutes.
          </p>

          {/* Step list */}
          <ol className="mt-8 space-y-1">
            {STEPS.map((s) => {
              const isActive = s.id === step;
              const isComplete = s.id < step;
              return (
                <li key={s.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-mono font-semibold",
                      isComplete
                        ? "border-ink bg-ink text-paper"
                        : isActive
                        ? "border-ink text-ink"
                        : "border-rule text-ink-400",
                    )}
                  >
                    {isComplete ? <Check className="h-3 w-3" /> : s.id}
                  </span>
                  <div className={cn(isActive ? "" : "opacity-60")}>
                    <p className="text-sm font-medium text-ink">{s.title}</p>
                    <p className="text-xs text-ink-500">{s.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* Right — form steps */}
      <div className="md:col-span-8">
        <div className="rounded-lg border border-rule bg-paper p-6 md:p-10 shadow-paper">
          {step === 1 && <Step1 form={form} errors={errors} update={update} />}
          {step === 2 && <Step2 form={form} errors={errors} update={update} />}
          {step === 3 && <Step3 form={form} errors={errors} update={update} toggleArrayValue={toggleArrayValue} />}
          {step === 4 && <Step4 form={form} />}

          <div className="mt-10 flex items-center justify-between border-t border-rule pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 1 || submitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length ? (
              <Button type="button" variant="primary" onClick={next}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="outbound" onClick={onSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for review"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — organizer ───────────────────────────────────────────
function Step1({ form, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Step 1 of 4</span>
        <h2 className="mt-2 font-display text-2xl tracking-tight">About you</h2>
        <p className="mt-1 text-sm text-ink-500">We need a way to reach you about the listing.</p>
      </header>

      <Field label="Your name or organization" error={errors.organizer_name} required>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={form.organizer_name}
            onChange={(e) => update("organizer_name", e.target.value)}
            placeholder="e.g. Matir Mohor"
            className="pl-10"
          />
        </div>
      </Field>

      <Field label="Phone number" error={errors.organizer_phone} required hint="So we can call you about the listing — never shown publicly.">
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={form.organizer_phone}
            onChange={(e) => update("organizer_phone", e.target.value)}
            placeholder="+880 …"
            inputMode="tel"
            className="pl-10"
          />
        </div>
      </Field>

      <Field label="Email (optional)" error={errors.organizer_email}>
        <Input
          type="email"
          value={form.organizer_email}
          onChange={(e) => update("organizer_email", e.target.value)}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Social link (optional)" hint="Instagram or Facebook — helps us verify.">
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="url"
            value={form.organizer_social_link}
            onChange={(e) => update("organizer_social_link", e.target.value)}
            placeholder="https://instagram.com/…"
            className="pl-10"
          />
        </div>
      </Field>
    </div>
  );
}

// ─── Step 2 — event ─────────────────────────────────────────────
function Step2({ form, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Step 2 of 4</span>
        <h2 className="mt-2 font-display text-2xl tracking-tight">About the event</h2>
        <p className="mt-1 text-sm text-ink-500">Title, date, venue — the basics people need to know.</p>
      </header>

      <Field label="Event name" error={errors.title} required>
        <Input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Hand-Thrown Pottery: A Weekend with the Wheel"
        />
      </Field>

      <Field label="Description" error={errors.description} required hint="Aim for 1–2 short paragraphs. Tell people what they'll get out of coming.">
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What is the event? Who's it for? Any prerequisites?"
          rows={6}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" error={errors.start_date} required>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => update("start_date", e.target.value)}
          />
        </Field>
        <Field label="Start time" error={errors.start_time} required>
          <Input
            type="time"
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="End date (optional)">
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => update("end_date", e.target.value)}
          />
        </Field>
        <Field label="End time (optional)">
          <Input
            type="time"
            value={form.end_time}
            onChange={(e) => update("end_time", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Venue name" error={errors.venue_name} required>
        <Input
          value={form.venue_name}
          onChange={(e) => update("venue_name", e.target.value)}
          placeholder="e.g. Nagar Baul Heritage House"
        />
      </Field>

      <Field label="Address / area details" error={errors.area_details} required hint="House, road, and a recognizable landmark.">
        <Textarea
          value={form.area_details}
          onChange={(e) => update("area_details", e.target.value)}
          placeholder="House 22, Road 7, beside Lake Park"
          rows={2}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" required>
          <Input value={form.city} disabled />
        </Field>
        <Field label="Sub-area" error={errors.sub_area} required>
          <select
            value={form.sub_area}
            onChange={(e) => update("sub_area", e.target.value)}
            className="flex h-11 w-full rounded-md border border-rule bg-paper px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink"
          >
            <option value="">Pick one</option>
            {SUB_AREAS_DHAKA.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Google Maps link (optional)">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="url"
            value={form.maps_link}
            onChange={(e) => update("maps_link", e.target.value)}
            placeholder="https://maps.google.com/…"
            className="pl-10"
          />
        </div>
      </Field>
    </div>
  );
}

// ─── Step 3 — details ───────────────────────────────────────────
function Step3({
  form,
  errors,
  update,
  toggleArrayValue,
}: StepProps & { toggleArrayValue: (key: "categories" | "audience_tags", v: string) => void }) {
  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Step 3 of 4</span>
        <h2 className="mt-2 font-display text-2xl tracking-tight">Details</h2>
        <p className="mt-1 text-sm text-ink-500">Categories, cost, and the link people will land on.</p>
      </header>

      <Field label="Categories" error={errors.categories} required hint="Pick one or more. Categories drive filtering.">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <SelectChip
              key={c.slug}
              active={form.categories.includes(c.slug)}
              onClick={() => toggleArrayValue("categories", c.slug)}
              type="button"
            >
              {c.name}
            </SelectChip>
          ))}
        </div>
      </Field>

      <Field label="Audience tags (optional)" hint="Help the right people find it.">
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_TAGS.map((t) => (
            <SelectChip
              key={t.slug}
              active={form.audience_tags.includes(t.slug)}
              onClick={() => toggleArrayValue("audience_tags", t.slug)}
              type="button"
            >
              {t.name}
            </SelectChip>
          ))}
        </div>
      </Field>

      <Field label="Cost" required>
        <div className="flex gap-2">
          <SelectChip
            active={form.price_type === "free"}
            onClick={() => update("price_type", "free")}
            type="button"
          >
            Free entry
          </SelectChip>
          <SelectChip
            active={form.price_type === "paid"}
            onClick={() => update("price_type", "paid")}
            type="button"
          >
            Paid
          </SelectChip>
        </div>
      </Field>

      {form.price_type === "paid" && (
        <Field label="Price note" error={errors.price_note} required hint="e.g. ৳500 per person, or ৳3,500 including materials">
          <Input
            value={form.price_note}
            onChange={(e) => update("price_note", e.target.value)}
            placeholder="৳500 per person"
          />
        </Field>
      )}

      <Field label="Official link" error={errors.outbound_link} required hint="Where should we send people? Registration, tickets, or your website.">
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="url"
            value={form.outbound_link}
            onChange={(e) => update("outbound_link", e.target.value)}
            placeholder="https://forms.gle/…"
            className="pl-10"
          />
        </div>
      </Field>

      <Field label="Poster image URL (optional)" hint="A square or 4:3 image works best. We'll host larger versions later.">
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="url"
            value={form.poster_url}
            onChange={(e) => update("poster_url", e.target.value)}
            placeholder="https://…"
            className="pl-10"
          />
        </div>
      </Field>

      <Field label="Expected attendance (optional)" hint="Helps us gauge reach and recommend slots.">
        <Input
          type="number"
          inputMode="numeric"
          value={form.expected_attendance}
          onChange={(e) => update("expected_attendance", e.target.value)}
          placeholder="e.g. 40"
        />
      </Field>

      <div className="rounded-lg border border-rule bg-cream-50 p-4">
        <Checkbox
          id="promotion"
          checked={form.wants_promotion_support}
          onChange={(e) => update("wants_promotion_support", e.target.checked)}
          label="I'm interested in future featured placement and promotion support from Cholo Jai."
        />
      </div>

      <Field label="Anything else? (optional)">
        <Textarea
          value={form.additional_notes}
          onChange={(e) => update("additional_notes", e.target.value)}
          placeholder="Special requirements, accessibility notes, or anything else we should know."
          rows={3}
        />
      </Field>
    </div>
  );
}

// ─── Step 4 — review ────────────────────────────────────────────
function Step4({ form }: { form: FormState }) {
  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Step 4 of 4</span>
        <h2 className="mt-2 font-display text-2xl tracking-tight">Review your submission</h2>
        <p className="mt-1 text-sm text-ink-500">Make sure everything looks right. We'll publish within 48 hours if it fits.</p>
      </header>

      <ReviewSection title="Organizer">
        <ReviewRow label="Name" value={form.organizer_name} />
        <ReviewRow label="Phone" value={form.organizer_phone} />
        {form.organizer_email && <ReviewRow label="Email" value={form.organizer_email} />}
        {form.organizer_social_link && <ReviewRow label="Social" value={form.organizer_social_link} />}
      </ReviewSection>

      <ReviewSection title="Event">
        <ReviewRow label="Title" value={form.title} />
        <ReviewRow label="Description" value={form.description} multi />
        <ReviewRow
          label="When"
          value={`${form.start_date} · ${form.start_time}${form.end_date ? ` — ${form.end_date} · ${form.end_time}` : ""}`}
        />
        <ReviewRow label="Where" value={`${form.venue_name}, ${form.area_details}, ${form.sub_area}, ${form.city}`} />
        {form.maps_link && <ReviewRow label="Maps" value={form.maps_link} />}
      </ReviewSection>

      <ReviewSection title="Discovery">
        <ReviewRow
          label="Categories"
          value={form.categories.map((c) => (
            <Badge key={c} variant="muted">{CATEGORIES.find((x) => x.slug === c)?.name ?? c}</Badge>
          ))}
        />
        {form.audience_tags.length > 0 && (
          <ReviewRow
            label="Audience"
            value={form.audience_tags.map((t) => (
              <Badge key={t} variant="muted">{AUDIENCE_TAGS.find((x) => x.slug === t)?.name ?? t}</Badge>
            ))}
          />
        )}
        <ReviewRow
          label="Cost"
          value={
            <span className="font-mono uppercase tracking-wider">
              {form.price_type === "free" ? "Free entry" : form.price_note || "Paid"}
            </span>
          }
        />
        <ReviewRow label="Official link" value={form.outbound_link} />
        {form.poster_url && <ReviewRow label="Poster" value={form.poster_url} />}
        {form.expected_attendance && <ReviewRow label="Expected" value={form.expected_attendance} />}
        {form.wants_promotion_support && (
          <p className="text-xs text-accent-700">Open to featured placement and promotion support.</p>
        )}
        {form.additional_notes && <ReviewRow label="Notes" value={form.additional_notes} multi />}
      </ReviewSection>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-rule p-5">
      <h3 className="eyebrow">{title}</h3>
      <dl className="mt-3 space-y-3">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value, multi }: { label: string; value: React.ReactNode; multi?: boolean }) {
  return (
    <div className={multi ? "" : "grid grid-cols-3 gap-3"}>
      <dt className={multi ? "eyebrow mb-1" : "eyebrow pt-0.5"}>{label}</dt>
      <dd className={multi ? "text-sm text-ink leading-relaxed whitespace-pre-wrap" : "col-span-2 text-sm text-ink break-words"}>
        {value || <span className="text-ink-400">—</span>}
      </dd>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <Label className="mb-2 inline-flex items-center gap-1">
        {label}
        {required && <span className="text-ember-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-ember-600">{error}</p>}
    </div>
  );
}

interface StepProps {
  form: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

function SuccessState({ isFallback }: { isFallback: boolean }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-accent-100 bg-accent-50 p-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-accent-100">
        <Check className="h-6 w-6 text-accent-600" />
      </span>
      <h2 className="mt-6 font-display text-3xl tracking-tight text-balance">
        Got it. We'll review it within 48 hours.
      </h2>
      <p className="mt-4 text-ink-700 leading-relaxed">
        We'll reach out via the phone or email you provided. If we don't publish it,
        we'll be honest about why.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="primary">
          <Link href="/events">Browse events</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}