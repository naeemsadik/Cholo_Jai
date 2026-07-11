import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CATEGORIES, AUDIENCE_TAGS } from "@/lib/categories";
import { FAQSchema } from "@/components/seo/structured-data";
import { readCmsPage as readLocalCmsPage } from "@/lib/cms-store";
import { serverGetCmsPage } from "@/lib/api.server";
import { getLocaleFromHeaders } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/event";
import type { CmsBlock } from "@/lib/cms-store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description:
    "Ghurighuri is your friend who always knows what's happening around the city. Read about how we curate, what we list, and how to get in touch.",
  alternates: { canonical: "/about" },
};

// Static fallback content — used when the CMS About page is missing or empty.
// Keeps the page meaningful if data/cms.json is corrupted.
const FALLBACK_BLOCKS: CmsBlock[] = [
  { kind: "heading", level: 1, en: "Hey — we're Ghurighuri." },
  {
    kind: "paragraph",
    en:
      "We're your friend who always knows what's happening around the city. Five hand-picked things to do in Dhaka, every week — no paywalls, no promotional fluff.",
  },
  { kind: "heading", level: 2, en: "Curated, not exhaustive." },
  {
    kind: "paragraph",
    en:
      "Dhaka has more events than anyone could ever attend. We're not trying to list all of them — we want to surface the ones worth showing up for.",
  },
  { kind: "heading", level: 2, en: "The questions we get most." },
  {
    kind: "faq",
    items: [
      {
        q: { en: "What is Ghurighuri?" },
        a: {
          en:
            "Ghurighuri is a curated weekly guide to events, places, and experiences in Dhaka, Bangladesh. We hand-pick five things worth stepping out for every week.",
        },
      },
      {
        q: { en: "How do I get tickets?" },
        a: {
          en:
            "Ghurighuri does not sell tickets. Tap the outbound CTA on an event page and we send you straight to the organizer's official page.",
        },
      },
    ],
  },
];

export default async function AboutPage() {
  const [locale, backendPage, localPage] = await Promise.all([
    getLocaleFromHeaders(),
    serverGetCmsPage("about"),
    readLocalCmsPage("about"),
  ]);
  // Prefer the backend CMS when available; fall back to local JSON, then
  // to the hard-coded FALLBACK_BLOCKS below.
  const blocks: CmsBlock[] =
    backendPage && Array.isArray(backendPage.blocks) && backendPage.blocks.length > 0
      ? (backendPage.blocks as CmsBlock[])
      : localPage?.blocks && localPage.blocks.length > 0
        ? localPage.blocks
        : FALLBACK_BLOCKS;

  // Build FAQ schema from the first `faq` block (always English — schema
  // pages are not localized; bilingual content would split ranking across
  // duplicated URLs).
  const faqBlock = blocks.find((b) => b.kind === "faq");
  const faqSchema = faqBlock
    ? (faqBlock as Extract<CmsBlock, { kind: "faq" }>).items.map((q) => ({
        question: q.q.en,
        answer: q.a.en,
      }))
    : [];

  return (
    <>
      {faqSchema.length > 0 && <FAQSchema items={faqSchema} />}

      {blocks.map((b, idx) => (
        <Block key={idx} block={b} locale={locale} />
      ))}

      {/* Static follow-up sections — keep them as part of the static
          template for now. New CMS blocks can replace them progressively. */}
      <WhatWeListSection />
      <AudienceSection />
      <OrganizerCta />
    </>
  );
}

function Block({ block, locale }: { block: CmsBlock; locale: "en" | "bn" }) {
  switch (block.kind) {
    case "heading": {
      const Tag = (`h${block.level}` as "h1" | "h2" | "h3");
      const text = pick({ en: block.en, bn: block.bn }, locale);
      if (block.level === 1) {
        return (
          <section className="border-b border-rule bg-cream-50">
            <div className="editorial-container py-16 md:py-24">
              <span className="eyebrow">About us</span>
              <Tag className="mt-4 font-display text-display-lg tracking-tight text-balance max-w-3xl">
                {text}
              </Tag>
            </div>
          </section>
        );
      }
      if (block.level === 2) {
        return (
          <section className="border-b border-rule bg-background">
            <div className="editorial-container py-12 md:py-16">
              <h2 className="font-display text-display-md tracking-tight text-balance">
                {text}
              </h2>
            </div>
          </section>
        );
      }
      return (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-8">
            <h3 className="font-display text-2xl tracking-tight text-ink">{text}</h3>
          </div>
        </section>
      );
    }
    case "paragraph": {
      const text = pick({ en: block.en, bn: block.bn }, locale);
      return (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-6">
            <p className="max-w-2xl text-ink-700 leading-relaxed">{text}</p>
          </div>
        </section>
      );
    }
    case "list": {
      return (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-10">
            <ul className="space-y-3">
              {block.items.map((it, i) => {
                const text = pick({ en: it.en, bn: it.bn }, locale);
                return (
                  <li key={i} className="flex items-baseline gap-3 border-b border-rule pb-3">
                    <span className="font-mono text-[0.65rem] text-ink-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {it.href ? (
                      <Link
                        href={it.href}
                        className="font-display text-lg text-ink hover:text-accent-700 transition-colors"
                      >
                        {text}
                      </Link>
                    ) : (
                      <span className="font-display text-lg text-ink">{text}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      );
    }
    case "faq": {
      return (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-16 md:py-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <span className="eyebrow">Quick answers</span>
                <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
                  The questions we get most.
                </h2>
              </div>
              <div className="md:col-span-7">
                <div className="divide-y divide-rule border-y border-rule">
                  {block.items.map((q, i) => {
                    const question = pick({ en: q.q.en, bn: q.q.bn }, locale);
                    const answer = pick({ en: q.a.en, bn: q.a.bn }, locale);
                    return (
                      <details key={i} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                          <h3 className="font-display text-lg leading-snug text-ink text-balance">
                            {question}
                          </h3>
                          <span
                            aria-hidden
                            className="mt-1 inline-block text-xl text-ink-500 transition-transform group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 max-w-2xl text-ink-700 leading-relaxed">{answer}</p>
                      </details>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
    case "image": {
      const alt = pick({ en: block.alt.en, bn: block.alt.bn }, locale);
      if (!block.src) return null;
      return (
        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-cream-200">
              <Image
                src={block.src}
                alt={alt}
                fill
                sizes="(min-width: 768px) 80vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

function WhatWeListSection() {
  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">What we list</span>
            <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
              The kind of stuff we&rsquo;d go to ourselves.
            </h2>
          </div>
          <div className="md:col-span-7">
            <div className="space-y-3">
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  className="flex items-baseline justify-between gap-4 border-b border-rule py-3"
                >
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
  );
}

function AudienceSection() {
  return (
    <section className="border-b border-rule bg-cream-50">
      <div className="editorial-container py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">Who it&rsquo;s for</span>
            <h2 className="mt-3 font-display text-display-md tracking-tight text-balance">
              Anyone who&rsquo;s tired of doomscrolling for plans.
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Audience tags are filters, not recommendations. Use them to find events that suit
              you &mdash; family-friendly, solo, free, indoor, or quiet.
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
  );
}

function OrganizerCta() {
  return (
    <section id="organizers" className="bg-ink text-paper">
      <div className="editorial-container py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <span className="eyebrow text-paper/60">For organizers</span>
            <h2 className="mt-4 font-display text-display-md tracking-tight text-balance">
              Running something fun? Tell us about it.
            </h2>
            <p className="mt-5 max-w-lg text-paper/80 leading-relaxed">
              We read every submission. If it fits, we&rsquo;ll publish within 48 hours. If it
              doesn&rsquo;t, we&rsquo;ll tell you honestly &mdash; no vague &ldquo;we&rsquo;ll
              get back to you&rdquo;. Featured spots are reserved for folks we work with
              directly.
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
  );
}