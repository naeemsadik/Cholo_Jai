"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, audienceTags, subAreas } from "@/lib/fallback-data";
import { postSubmission, trackFormSubmission } from "@/lib/api";
import { clsx } from "@/lib/util";

type Errors = Partial<Record<string, string>>;

export function SubmitForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    organizer_name: "",
    organizer_phone: "",
    organizer_email: "",
    organizer_social_link: "",
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_time: "",
    venue_name: "",
    area_details: "",
    city: "Dhaka",
    sub_area: "",
    maps_link: "",
    categories: [] as string[],
    audience_tags: [] as string[],
    price_type: "free" as "free" | "paid",
    price_note: "",
    outbound_link: "",
    wants_promotion_support: false,
    additional_notes: "",
    poster_url: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (key: "categories" | "audience_tags", value: string) =>
    setForm((f) => {
      const has = f[key].includes(value);
      return { ...f, [key]: has ? f[key].filter((x) => x !== value) : [...f[key], value] };
    });

  const validateStep = (s: 1 | 2 | 3): boolean => {
    const e: Errors = {};
    if (s === 1) {
      if (!form.organizer_name.trim()) e.organizer_name = "Required.";
      if (!form.organizer_phone.trim()) e.organizer_phone = "Required.";
      if (form.organizer_email && !/^\S+@\S+\.\S+$/.test(form.organizer_email))
        e.organizer_email = "Enter a valid email.";
    }
    if (s === 2) {
      if (!form.title.trim()) e.title = "Required.";
      if (!form.description.trim() || form.description.trim().length < 20)
        e.description = "At least 20 characters.";
      if (!form.start_date) e.start_date = "Required.";
      if (!form.start_time) e.start_time = "Required.";
      if (!form.venue_name.trim()) e.venue_name = "Required.";
      if (!form.area_details.trim()) e.area_details = "Required.";
      if (!form.sub_area) e.sub_area = "Required.";
      if (form.categories.length === 0) e.categories = "Pick at least one.";
    }
    if (s === 3) {
      if (!form.outbound_link.trim()) e.outbound_link = "Required.";
      if (!form.poster_url.trim()) e.poster_url = "Required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => (s === 3 ? 3 : ((s + 1) as 1 | 2 | 3)));
  };
  const back = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)));

  const submit = async () => {
    if (!validateStep(step)) return;
    setSubmitting(true);
    await postSubmission(form);
    trackFormSubmission("submit-event");
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bg-paper">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-20 md:py-32">
          <div className="border border-ink bg-bone p-10 md:p-16 text-center max-w-2xl mx-auto">
            <div className="eyebrow !justify-center mb-4">Status · 200 OK</div>
            <h2 className="t-huge tracking-tighter mb-5">
              Filed.<br />
              <span className="font-serif italic text-accent">On the bench.</span>
            </h2>
            <p className="font-serif text-lg leading-relaxed text-ink/85 mb-6 max-w-md mx-auto">
              Your submission is queued for manual review. We&rsquo;ll email{" "}
              <strong>{form.organizer_email || "you"}</strong> within 48 hours
              with a decision and any follow-up questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="btn-primary">◂ Back to home</Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    organizer_name: "", organizer_phone: "", organizer_email: "", organizer_social_link: "",
                    title: "", description: "", start_date: "", start_time: "", end_time: "",
                    venue_name: "", area_details: "", city: "Dhaka", sub_area: "", maps_link: "",
                    categories: [], audience_tags: [], price_type: "free", price_note: "",
                    outbound_link: "", wants_promotion_support: false, additional_notes: "", poster_url: "",
                  });
                  setStep(1);
                }}
                className="btn-ghost"
              >
                ＋ Submit another
              </button>
            </div>
            <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              REF / SUB-{Math.random().toString(36).slice(2, 8).toUpperCase()} · Pending review
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper">
      <div className="border-b border-ink">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-12 md:py-20">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-9">
              <div className="eyebrow mb-3">For organizers · Dhaka · 30-day pilot</div>
              <h1 className="t-huge tracking-tighter">
                Submit your<br />
                <span className="font-serif italic text-accent">event.</span>
              </h1>
            </div>
            <div className="col-span-12 md:col-span-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65 md:text-right">
              Step {step} / 3
              <br />
              <span className="text-ink/85">
                {step === 1 ? "Organizer" : step === 2 ? "Details" : "Links & review"}
              </span>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-8 grid grid-cols-3 border border-ink" aria-label="Progress">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                aria-current={step === n ? "step" : undefined}
                className={clsx(
                  "h-1.5 border-r border-ink last:border-r-0",
                  step >= n ? "bg-accent" : "bg-transparent"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-ed px-5 md:px-8 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <div className="border border-ink bg-bone p-5 md:p-6 md:sticky md:top-28">
            <div className="eyebrow !text-accent mb-3">Form guide</div>
            <ul className="space-y-4 text-[13px] text-ink">
              {[
                ["01", "Be specific.", "Vague titles get cut. Tell us what is actually happening."],
                ["02", "Real links.", "Official registration, tickets, or organizer contact only."],
                ["03", "Honest dates.", "Cancellations get archived, not deleted."],
                ["04", "Manual review.", "We read every submission. Expect 24–48 hours."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-accent font-semibold mt-0.5">{n}</span>
                  <div>
                    <strong className="block">{t}</strong>
                    <span className="block text-ink/70 leading-snug">{d}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-ink/15">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">Support</div>
              <a href="mailto:hello@cholojai.bd" className="link-accent text-[13px]">hello@cholojai.bd</a>
            </div>
          </div>
        </aside>

        <div className="col-span-12 md:col-span-9">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="border border-ink bg-bone"
          >
            {step === 1 && (
              <div className="p-6 md:p-10 space-y-6">
                <StepHeader n="01" title="Organizer" hint="Who's running this?" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full name / org" required error={errors.organizer_name}>
                    <input
                      aria-invalid={!!errors.organizer_name}
                      className="input-brut"
                      value={form.organizer_name}
                      onChange={(e) => set("organizer_name", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone" required error={errors.organizer_phone}>
                    <input
                      aria-invalid={!!errors.organizer_phone}
                      className="input-brut"
                      value={form.organizer_phone}
                      onChange={(e) => set("organizer_phone", e.target.value)}
                      placeholder="+880"
                    />
                  </Field>
                  <Field label="Email" hint="Only used for this listing" error={errors.organizer_email}>
                    <input
                      type="email"
                      aria-invalid={!!errors.organizer_email}
                      className="input-brut"
                      value={form.organizer_email}
                      onChange={(e) => set("organizer_email", e.target.value)}
                    />
                  </Field>
                  <Field label="Social link" hint="IG / FB / LinkedIn">
                    <input
                      className="input-brut"
                      value={form.organizer_social_link}
                      onChange={(e) => set("organizer_social_link", e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 md:p-10 space-y-6">
                <StepHeader n="02" title="Event details" hint="What, when, where" />
                <Field label="Event title" required error={errors.title}>
                  <input
                    aria-invalid={!!errors.title}
                    className="input-brut"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Saturday Morning Run: Purbachal Loop"
                  />
                </Field>
                <Field label="Description" required hint="Plain English — what's actually happening" error={errors.description}>
                  <textarea
                    aria-invalid={!!errors.description}
                    className="input-brut min-h-[140px]"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Field label="Start date" required error={errors.start_date}>
                    <input type="date" className="input-brut" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
                  </Field>
                  <Field label="Start time" required error={errors.start_time}>
                    <input type="time" className="input-brut" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
                  </Field>
                  <Field label="End time" hint="optional">
                    <input type="time" className="input-brut" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Venue name" required error={errors.venue_name}>
                    <input className="input-brut" value={form.venue_name} onChange={(e) => set("venue_name", e.target.value)} />
                  </Field>
                  <Field label="Area / address" required error={errors.area_details}>
                    <input className="input-brut" value={form.area_details} onChange={(e) => set("area_details", e.target.value)} />
                  </Field>
                  <Field label="Sector" required error={errors.sub_area}>
                    <select
                      aria-invalid={!!errors.sub_area}
                      className="input-brut"
                      value={form.sub_area}
                      onChange={(e) => set("sub_area", e.target.value)}
                    >
                      <option value="">Select sector</option>
                      {subAreas.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Google Maps URL" hint="optional, recommended">
                    <input className="input-brut" value={form.maps_link} onChange={(e) => set("maps_link", e.target.value)} />
                  </Field>
                </div>
                <Field label="Categories" required hint="Pick 1–3" error={errors.categories}>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggle("categories", c.slug)}
                        aria-pressed={form.categories.includes(c.slug)}
                        className={clsx("chip cursor-pointer focus-ring", form.categories.includes(c.slug) && "chip-ink")}
                      >
                        {form.categories.includes(c.slug) ? "■ " : "▢ "}
                        {c.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Audience tags" hint="optional">
                  <div className="flex flex-wrap gap-2">
                    {audienceTags.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggle("audience_tags", t.slug)}
                        aria-pressed={form.audience_tags.includes(t.slug)}
                        className={clsx("chip cursor-pointer focus-ring", form.audience_tags.includes(t.slug) && "chip-ink")}
                      >
                        {form.audience_tags.includes(t.slug) ? "■ " : "▢ "}
                        {t.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Pricing">
                  <div className="grid grid-cols-2 border border-ink">
                    {(["free", "paid"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set("price_type", p)}
                        aria-pressed={form.price_type === p}
                        className={clsx(
                          "py-3 font-mono uppercase tracking-[0.18em] text-[12px] focus-ring",
                          p === "paid" && "border-l border-ink",
                          form.price_type === p ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink hover:text-paper"
                        )}
                      >
                        {p === "free" ? "● Free" : "◐ Paid"}
                      </button>
                    ))}
                  </div>
                </Field>
                {form.price_type === "paid" && (
                  <Field label="Price note" hint="e.g. ৳500 advance / ৳800 door">
                    <input className="input-brut" value={form.price_note} onChange={(e) => set("price_note", e.target.value)} />
                  </Field>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="p-6 md:p-10 space-y-6">
                <StepHeader n="03" title="Links & review" hint="Outbound + poster" />
                <Field label="Official outbound link" required hint="Registration, tickets, or organizer contact" error={errors.outbound_link}>
                  <input
                    aria-invalid={!!errors.outbound_link}
                    className="input-brut"
                    value={form.outbound_link}
                    onChange={(e) => set("outbound_link", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Poster image URL" required hint="Hosted URL (uploads post-MVP)" error={errors.poster_url}>
                  <input
                    aria-invalid={!!errors.poster_url}
                    className="input-brut"
                    value={form.poster_url}
                    onChange={(e) => set("poster_url", e.target.value)}
                  />
                </Field>
                {form.poster_url && (
                  <div className="border border-ink p-3 bg-paper">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-2">▸ Preview</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.poster_url} alt="Poster preview" className="max-h-72 object-contain poster-treat" />
                  </div>
                )}
                <Field label="Additional notes" hint="optional — anything we should know">
                  <textarea className="input-brut min-h-[100px]" value={form.additional_notes} onChange={(e) => set("additional_notes", e.target.value)} />
                </Field>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.wants_promotion_support}
                    onChange={(e) => set("wants_promotion_support", e.target.checked)}
                    className="w-5 h-5 border border-ink accent-accent"
                  />
                  <span className="text-sm">
                    I&rsquo;m interested in future paid promotion support
                  </span>
                </label>

                <div className="border border-ink bg-paper p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">▸ Summary</div>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                    <Summary k="Organizer">{form.organizer_name}</Summary>
                    <Summary k="Phone">{form.organizer_phone}</Summary>
                    <Summary k="Title">{form.title}</Summary>
                    <Summary k="Date">{form.start_date} · {form.start_time}</Summary>
                    <Summary k="Sector">{form.sub_area}</Summary>
                    <Summary k="Categories">{form.categories.join(", ")}</Summary>
                    <Summary k="Type">{form.price_type}{form.price_note ? ` · ${form.price_note}` : ""}</Summary>
                    <Summary k="Outbound">{form.outbound_link}</Summary>
                  </dl>
                </div>
              </div>
            )}

            <div className="px-6 md:px-10 py-5 border-t border-ink bg-paper flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ◂ Back
              </button>
              {step < 3 ? (
                <button type="button" onClick={next} className="btn-primary">
                  Next <span aria-hidden>▸</span>
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting} className="btn-accent disabled:opacity-60">
                  {submitting ? "Filing…" : "▶ File submission"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function StepHeader({ n, title, hint }: { n: string; title: string; hint: string }) {
  return (
    <div className="border-b border-ink pb-5">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-4xl text-accent tracking-tightest leading-none">{n}</span>
        <h2 className="font-display text-2xl md:text-3xl tracking-tighter">{title}</h2>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60 mt-2">{hint}</p>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="label-brut">{label}</label>
        {required && <span className="chip-accent">REQ</span>}
        {hint && <span className="text-[11px] text-ink/60">— {hint}</span>}
      </div>
      {children}
      {error && (
        <div role="alert" className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

function Summary({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60">{k}</dt>
      <dd className="text-[13px] truncate">{children || <span className="text-ink/40">—</span>}</dd>
    </div>
  );
}