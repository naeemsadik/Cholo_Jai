"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Copy,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toaster";
import { adminCreateEvent, adminGetSettings } from "@/lib/api";
import { slugify } from "@/lib/utils";
import {
  CATEGORIES,
  AUDIENCE_TAGS,
  SUB_AREAS,
  OUTBOUND_BUTTON_LABELS,
} from "@/lib/categories";
import type { Event, EventStatus, OutboundButtonLabel, PriceType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FormState {
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  slug: string;
  poster_url: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  city: string;
  sub_area: string;
  venue_name: string;
  venue_name_bn: string;
  area_details: string;
  area_details_bn: string;
  maps_link: string;
  categories: string[];
  audience_tags: string[];
  price_type: PriceType;
  price_note: string;
  organizer_name: string;
  organizer_phone: string;
  organizer_email: string;
  organizer_social_link: string;
  outbound_link: string;
  outbound_button_label: OutboundButtonLabel;
  is_featured: boolean;
  show_in_hero: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  title_bn: "",
  description: "",
  description_bn: "",
  slug: "",
  poster_url: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  city: "Dhaka",
  sub_area: "Dhanmondi",
  venue_name: "",
  venue_name_bn: "",
  area_details: "",
  area_details_bn: "",
  maps_link: "",
  categories: [],
  audience_tags: [],
  price_type: "free",
  price_note: "",
  organizer_name: "",
  organizer_phone: "",
  organizer_email: "",
  organizer_social_link: "",
  outbound_link: "",
  outbound_button_label: "Register",
  is_featured: false,
  show_in_hero: false,
};

const REQUIRED_FIELDS: Array<keyof FormState> = [
  "title",
  "description",
  "poster_url",
  "start_date",
  "start_time",
  "city",
  "sub_area",
  "venue_name",
  "area_details",
  "organizer_name",
  "organizer_phone",
  "outbound_link",
];

export function EventCreateView() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState<null | "draft" | "publish">(null);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  // Pull platform defaults on mount — the admin can pre-fill the form
  // with the standard outbound label and city so it's one fewer field
  // to think about.
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await adminGetSettings();
      if (!mounted) return;
      if (res.data) {
        setForm((prev) => ({
          ...prev,
          outbound_button_label: res.data.default_outbound_label ?? prev.outbound_button_label,
          city: prev.city || res.data.default_city || prev.city,
        }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function toggleArrayValue<K extends "categories" | "audience_tags">(
    key: K,
    value: string,
  ) {
    setForm((prev) => {
      const current = prev[key] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next as FormState[K] };
    });
  }

  function validate(): { ok: boolean; errors: Partial<Record<keyof FormState, string>> } {
    const next: Partial<Record<keyof FormState, string>> = {};
    for (const f of REQUIRED_FIELDS) {
      const v = form[f];
      if (typeof v === "string" && v.trim().length === 0) {
        next[f] = "This field is required.";
      }
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      next.end_date = "End date must be on or after the start date.";
    }
    if (form.outbound_link && !/^https?:\/\//i.test(form.outbound_link)) {
      next.outbound_link = "Use a full URL starting with https://";
    }
    if (form.categories.length === 0) {
      next.categories = "Pick at least one category.";
    }
    return { ok: Object.keys(next).length === 0, errors: next };
  }

  async function save(target: "draft" | "publish") {
    const v = validate();
    if (!v.ok) {
      setErrors(v.errors);
      toast({
        title: "Check the highlighted fields",
        description: "Required fields are missing or invalid.",
        variant: "destructive",
      });
      // Scroll to the first error
      const first = Object.keys(v.errors)[0];
      if (first) {
        const el = document.querySelector(`[data-field="${first}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitting(target);
    setErrors({});
    const status: EventStatus = target === "publish" ? "published" : "draft";
    const payload: Omit<Event, "id" | "created_at" | "updated_at" | "status"> = {
      title: form.title.trim(),
      title_bn: form.title_bn.trim() || null,
      description: form.description.trim(),
      description_bn: form.description_bn.trim() || null,
      slug: form.slug.trim() || slugify(form.title),
      poster_url: form.poster_url.trim(),
      poster_alt: null,
      poster_alt_bn: null,
      start_date: form.start_date,
      start_time: form.start_time,
      end_date: form.end_date || null,
      end_time: form.end_time || null,
      city: form.city,
      sub_area: form.sub_area,
      venue_name: form.venue_name.trim(),
      venue_name_bn: form.venue_name_bn.trim() || null,
      area_details: form.area_details.trim(),
      area_details_bn: form.area_details_bn.trim() || null,
      maps_link: form.maps_link.trim() || null,
      categories: form.categories,
      audience_tags: form.audience_tags,
      price_type: form.price_type,
      price_note: form.price_note.trim() || null,
      organizer: {
        name: form.organizer_name.trim(),
        phone: form.organizer_phone.trim() || null,
        email: form.organizer_email.trim() || null,
        social_link: form.organizer_social_link.trim() || null,
      },
      outbound_link: form.outbound_link.trim(),
      outbound_button_label: form.outbound_button_label,
      is_featured: form.is_featured,
      is_recommended: false,
      show_in_hero: form.show_in_hero,
      source_link: null,
      admin_notes: null,
      expected_attendance: null,
    };
    const res = await adminCreateEvent({ ...payload, status });
    setSubmitting(null);
    if (res.data) {
      toast({
        title: target === "publish" ? "Event published" : "Saved as draft",
        description: res.data.title,
        variant: "success",
      });
      router.push(`/admin/events/${res.data.slug}`);
    } else {
      toast({
        title: "Could not save event",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  }

  function copyEnToBn(field: "title" | "description" | "venue_name" | "area_details") {
    const enValue = form[field];
    const bnField = (`${field}_bn` as const);
    patch(bnField, enValue);
  }

  const coverage = React.useMemo(() => {
    const enFields: Array<keyof FormState> = ["title", "description", "venue_name", "area_details"];
    const bnFields: Array<keyof FormState> = ["title_bn", "description_bn", "venue_name_bn", "area_details_bn"];
    const filled = bnFields.filter((f) => (form[f] as string).trim().length > 0).length;
    const total = bnFields.length;
    return { filled, total, hasEnglish: enFields.every((f) => (form[f] as string).trim().length > 0) };
  }, [form]);

  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              All events
            </Link>
          </Button>
          <Badge variant="muted" className="text-[0.65rem] font-mono uppercase tracking-wider">
            New event
          </Badge>
        </div>

        <h1 className="font-display text-display-sm tracking-tight">Create a new event</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Fill in the basics — title, when, where, and who&rsquo;s organising.
          You can refine translations, schedule, and outbound details after
          the first save.
        </p>

        {/* BASICS — title / description */}
        <section className="mt-8 space-y-5">
          <SectionHeader
            title="The basics"
            description="English is the primary text. Bangla is optional but recommended for our default Bangla audience."
          />

          <BilingualField
            label="Event title (English)"
            required
            fieldKey="title"
            error={errors.title}
          >
            <Input
              value={form.title}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="A workshop, a concert, a meetup…"
            />
          </BilingualField>

          <BilingualField
            label="Title (বাংলা)"
            fieldKey="title_bn"
            bnField
            onCopyEn={() => copyEnToBn("title")}
            error={errors.title_bn}
          >
            <Input
              value={form.title_bn}
              onChange={(e) => patch("title_bn", e.target.value)}
              placeholder="ঐচ্ছিক — পরে এডিটর পূরণ করতে পারেন"
              dir="auto"
            />
          </BilingualField>

          <BilingualField
            label="Description (English)"
            required
            fieldKey="description"
            error={errors.description}
          >
            <Textarea
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              rows={5}
              placeholder="What's it about? Who's it for? Anything attendees should bring?"
            />
          </BilingualField>

          <BilingualField
            label="Description (বাংলা)"
            fieldKey="description_bn"
            bnField
            onCopyEn={() => copyEnToBn("description")}
            error={errors.description_bn}
          >
            <Textarea
              value={form.description_bn}
              onChange={(e) => patch("description_bn", e.target.value)}
              rows={5}
              placeholder="ঐচ্ছিক — পরে এডিটর পূরণ করতে পারেন"
              dir="auto"
            />
          </BilingualField>

          <div>
            <Label className="mb-1.5 inline-block">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => patch("slug", e.target.value)}
              placeholder={slugify(form.title) || "auto-generated-from-title"}
            />
            <p className="mt-1 text-xs text-ink-500">
              Used in the public URL: <code className="font-mono">/events/&lt;slug&gt;</code>.
              Keep it short and Latin-only.
            </p>
          </div>

          <Field
            label="Poster / image URL"
            required
            fieldKey="poster_url"
            error={errors.poster_url}
            hint="Use a full hosted image URL."
          >
            <Input
              value={form.poster_url}
              onChange={(e) => patch("poster_url", e.target.value)}
              placeholder="https://example.com/event-poster.jpg"
            />
          </Field>
        </section>

        <Separator className="my-10" />

        {/* SCHEDULE */}
        <section className="space-y-5">
          <SectionHeader title="When" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start date" required error={errors.start_date}>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => patch("start_date", e.target.value)}
              />
            </Field>
            <Field label="Start time" required error={errors.start_time}>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => patch("start_time", e.target.value)}
              />
            </Field>
            <Field label="End date" hint="Optional" error={errors.end_date}>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => patch("end_date", e.target.value)}
              />
            </Field>
            <Field label="End time" hint="Optional">
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => patch("end_time", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <Separator className="my-10" />

        {/* LOCATION */}
        <section className="space-y-5">
          <SectionHeader title="Where" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="City" required>
              <Input value={form.city} onChange={(e) => patch("city", e.target.value)} />
            </Field>
            <Field label="Sub-area" required>
              <Select
                value={form.sub_area}
                onValueChange={(v) => patch("sub_area", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_AREAS.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <BilingualField
            label="Venue name (English)"
            required
            fieldKey="venue_name"
            error={errors.venue_name}
          >
            <Input
              value={form.venue_name}
              onChange={(e) => patch("venue_name", e.target.value)}
            />
          </BilingualField>

          <BilingualField
            label="Venue name (বাংলা)"
            fieldKey="venue_name_bn"
            bnField
            onCopyEn={() => copyEnToBn("venue_name")}
          >
            <Input
              value={form.venue_name_bn}
              onChange={(e) => patch("venue_name_bn", e.target.value)}
              dir="auto"
            />
          </BilingualField>

          <BilingualField
            label="Landmark / how to find it (English)"
            required
            fieldKey="area_details"
            error={errors.area_details}
          >
            <Textarea
              value={form.area_details}
              onChange={(e) => patch("area_details", e.target.value)}
              rows={2}
            />
          </BilingualField>

          <BilingualField
            label="Landmark (বাংলা)"
            fieldKey="area_details_bn"
            bnField
            onCopyEn={() => copyEnToBn("area_details")}
          >
            <Textarea
              value={form.area_details_bn}
              onChange={(e) => patch("area_details_bn", e.target.value)}
              rows={2}
              dir="auto"
            />
          </BilingualField>

          <Field label="Google Maps link" hint="Optional">
            <Input
              value={form.maps_link}
              onChange={(e) => patch("maps_link", e.target.value)}
              placeholder="https://maps.google.com/…"
            />
          </Field>
        </section>

        <Separator className="my-10" />

        {/* CATEGORIES & TAGS */}
        <section className="space-y-5">
          <SectionHeader title="Categories & tags" />
          <Field label="Categories" required error={errors.categories}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = form.categories.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleArrayValue("categories", c.slug)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-all",
                      active
                        ? "border-ink bg-ink text-paper"
                        : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Audience tags" hint="Optional — pick any that fit">
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_TAGS.map((t) => {
                const active = form.audience_tags.includes(t.slug);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleArrayValue("audience_tags", t.slug)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-all",
                      active
                        ? "border-accent-500 bg-accent-500 text-paper"
                        : "border-rule bg-paper text-ink-700 hover:border-ink-300 hover:text-ink",
                    )}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </section>

        <Separator className="my-10" />

        {/* PRICE */}
        <section className="space-y-5">
          <SectionHeader title="Price" />
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_type"
                checked={form.price_type === "free"}
                onChange={() => patch("price_type", "free")}
                className="h-4 w-4"
              />
              <span className="text-sm">Free entry</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price_type"
                checked={form.price_type === "paid"}
                onChange={() => patch("price_type", "paid")}
                className="h-4 w-4"
              />
              <span className="text-sm">Paid</span>
            </label>
          </div>
          {form.price_type === "paid" && (
            <Field label="Price note">
              <Input
                value={form.price_note}
                onChange={(e) => patch("price_note", e.target.value)}
                placeholder="৳500 per person"
              />
            </Field>
          )}
        </section>

        <Separator className="my-10" />

        {/* ORGANIZER */}
        <section className="space-y-5">
          <SectionHeader title="Organizer" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required error={errors.organizer_name}>
              <Input
                value={form.organizer_name}
                onChange={(e) => patch("organizer_name", e.target.value)}
              />
            </Field>
            <Field label="Phone" required error={errors.organizer_phone}>
              <Input
                value={form.organizer_phone}
                onChange={(e) => patch("organizer_phone", e.target.value)}
                placeholder="+880 …"
              />
            </Field>
            <Field label="Email" hint="Optional">
              <Input
                type="email"
                value={form.organizer_email}
                onChange={(e) => patch("organizer_email", e.target.value)}
              />
            </Field>
            <Field label="Instagram / website" hint="Optional">
              <Input
                value={form.organizer_social_link}
                onChange={(e) => patch("organizer_social_link", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <Separator className="my-10" />

        {/* OUTBOUND */}
        <section className="space-y-5">
          <SectionHeader
            title="Outbound"
            description="Where the public site sends people who tap the CTA. Not your poster — the link where they actually sign up."
          />
          <Field label="Registration / ticket / official link" required error={errors.outbound_link}>
            <Input
              value={form.outbound_link}
              onChange={(e) => patch("outbound_link", e.target.value)}
              placeholder="https://forms.gle/…"
            />
          </Field>
          <Field label="Button label">
            <Select
              value={form.outbound_button_label}
              onValueChange={(v) => patch("outbound_button_label", v as OutboundButtonLabel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTBOUND_BUTTON_LABELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </section>

        <Separator className="my-10" />

        {/* PROMOTION */}
        <section className="space-y-3">
          <SectionHeader title="Promotion" />
          <Checkbox
            label="Mark as featured (curator's pick)"
            checked={form.is_featured}
            onChange={(e) => patch("is_featured", e.target.checked)}
          />
          <Checkbox
            label="Add to homepage hero carousel"
            checked={form.show_in_hero}
            onChange={(e) => patch("show_in_hero", e.target.checked)}
          />
        </section>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-wrap items-center justify-end gap-2 border-t border-rule pt-6">
          <Button asChild variant="ghost" size="lg">
            <Link href="/admin/events">Cancel</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => save("draft")}
            disabled={submitting !== null}
          >
            {submitting === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => save("publish")}
            disabled={submitting !== null}
          >
            {submitting === "publish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Save & publish
          </Button>
        </div>
      </div>

      {/* Right column — translation coverage + help */}
      <aside className="md:col-span-4 space-y-4">
        <div className="rounded-lg border border-rule bg-paper p-5">
          <span className="eyebrow">Translation coverage</span>
          <p className="mt-2 text-2xl font-display tabular-nums">
            {coverage.filled} / {coverage.total}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Bangla fields filled. English is always required.
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full bg-accent-500 transition-all"
              style={{ width: `${(coverage.filled / coverage.total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Tip: leave Bangla empty if you don&rsquo;t have it. Our editors
            fill it in before publishing.
          </p>
        </div>

        <div className="rounded-lg border border-rule bg-paper p-5">
          <span className="eyebrow">Required fields</span>
          <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.title ? "text-accent-700" : "text-ink-300")} />
              Title & description (English)
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.start_date && form.start_time ? "text-accent-700" : "text-ink-300")} />
              Start date & time
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.venue_name && form.area_details ? "text-accent-700" : "text-ink-300")} />
              Venue name & landmark
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.categories.length > 0 ? "text-accent-700" : "text-ink-300")} />
              At least one category
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.outbound_link ? "text-accent-700" : "text-ink-300")} />
              Outbound link
            </li>
            <li className="flex items-center gap-1.5">
              <Check className={cn("h-3 w-3", form.organizer_name && form.organizer_phone ? "text-accent-700" : "text-ink-300")} />
              Organiser name & phone
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-ember-100 bg-ember-50/40 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-ember-700" />
            <span className="eyebrow text-ember-700">Heads up</span>
          </div>
          <p className="mt-2 text-xs text-ember-700 leading-relaxed">
            Publishing makes the event live on the public site immediately.
            Use &ldquo;Save as draft&rdquo; if you&rsquo;re still collecting
            information from the organiser.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ── Small primitives ──────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="font-display text-lg tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
  );
}

function Field({
  label,
  fieldKey,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  fieldKey?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={fieldKey ?? label}>
      <Label className="mb-1.5 inline-block">
        {label}
        {required && <span className="ml-1 text-ember-600">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-ember-700">{error}</p>}
    </div>
  );
}

function BilingualField({
  label,
  fieldKey,
  bnField,
  onCopyEn,
  required,
  error,
  children,
}: {
  label: string;
  fieldKey: string;
  bnField?: boolean;
  onCopyEn?: () => void;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={fieldKey} className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {required && <span className="ml-1 text-ember-600">*</span>}
        </Label>
        {bnField && onCopyEn && (
          <button
            type="button"
            onClick={onCopyEn}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink"
            title="Copy the English value into the Bangla field as a starting point"
          >
            <Copy className="h-3 w-3" />
            Copy from English
          </button>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-ember-700">{error}</p>}
    </div>
  );
}
