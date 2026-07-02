import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CATEGORIES, AUDIENCE_TAGS } from "@/lib/categories";

export const metadata: Metadata = {
  title: "About",
  description:
    "Cholo Jai is a curated event discovery platform for Bangladesh, launching in Dhaka. Read about how we curate, what we cover, and how to get in touch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — editorial */}
      <section className="border-b border-rule bg-cream-50">
        <div className="editorial-container py-16 md:py-24">
          <span className="eyebrow">About Cholo Jai</span>
          <h1 className="mt-4 font-display text-display-lg tracking-tight text-balance max-w-3xl">
            A small, careful list of events worth showing up for.
          </h1>
          <p className="mt-6 max-w-2xl font-display text-xl leading-snug text-ink-700 text-pretty">
            Cholo Jai is a 30-day validation project — a curated event
            discovery platform for Bangladesh, starting with Dhaka.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-rule bg-background">
        <div className="editorial-container py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow" id="curation">The curatorial thesis</span>
              <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                Curated, not exhaustive.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-ink-700 leading-relaxed">
              <p>
                Dhaka has more events than anyone could ever attend. We're not
                trying to list all of them — we want to surface the ones worth
                showing up for. Small workshops over big corporate conferences.
                Neighborhood gatherings over mass festivals. Paid work that
                respects its makers, and free events that respect their audiences.
              </p>
              <p>
                Every event on the site is checked by a human. We confirm the
                venue, verify the organizer, and pull the listing if anything
                looks off. We're not trying to be everything to everyone — just
                a useful, honest guide to the week ahead.
              </p>
              <p>
                The first 30 days are a test. We want to know whether this is
                worth continuing, pivoting, or stopping — based on whether
                people show up, not whether we get clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we cover */}
      <section className="border-b border-rule bg-background">
        <div className="editorial-container py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow">What we list</span>
              <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                Events we want to surface.
              </h2>
            </div>
            <div className="md:col-span-7">
              <div className="space-y-3">
                {CATEGORIES.map((c) => (
                  <div key={c.id} className="flex items-baseline justify-between gap-4 border-b border-rule py-3">
                    <p className="font-display text-lg text-ink">{c.name}</p>
                    <Link
                      href={`/events?category=${c.slug}`}
                      className="text-xs font-mono uppercase tracking-wider text-ink-500 hover:text-ink transition-colors"
                    >
                      See events →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="border-b border-rule bg-cream-50">
        <div className="editorial-container py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow">Who it's for</span>
              <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                We're thinking about specific people.
              </h2>
              <p className="mt-4 text-ink-500 leading-relaxed">
                Audience tags are filters, not recommendations. Use them to find events
                that suit you — family-friendly, solo, free, indoor, or quiet.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_TAGS.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex h-9 items-center rounded-full border border-rule bg-paper px-4 text-sm font-medium text-ink-700"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer CTA */}
      <section id="organizers" className="bg-ink text-paper">
        <div className="editorial-container py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-paper/60">For organizers</span>
              <h2 className="mt-4 font-display text-display-md tracking-tight text-balance">
                Run something worth attending?
              </h2>
              <p className="mt-5 max-w-lg text-paper/80 leading-relaxed">
                Submit it. We read every submission, and we'll publish it within
                48 hours if it fits our editorial. If it doesn't, we'll say so
                honestly — not with a vague "we'll get back to you" template.
              </p>
            </div>
            <div className="md:col-span-5 md:flex md:justify-end">
              <Button asChild variant="primary" size="xl" className="bg-paper text-ink hover:bg-cream-100">
                <Link href="/submit">Submit your event →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}