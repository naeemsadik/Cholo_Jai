import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/categories";

// Editorial hero — designed to feel like the cover of a printed program, NOT a generic SaaS hero
export function Hero({ upcomingCount }: { upcomingCount: number }) {
  const featuredCats = CATEGORIES.slice(0, 6);
  return (
    <section className="relative overflow-hidden border-b border-rule bg-cream-50">
      <div className="editorial-container relative pb-16 pt-12 md:pb-24 md:pt-20">
        {/* Top eyebrow + tag */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="ink" className="font-mono">
              ISSUE · 02
            </Badge>
            <span className="eyebrow">Dhaka · weekly curated</span>
          </div>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-wider">
            {upcomingCount} events in rotation
          </p>
        </div>

        {/* Editorial display headline */}
        <div className="mt-10 md:mt-16">
          <h1 className="font-display text-display-xl font-medium tracking-tight text-balance">
            Find events <span className="italic text-accent-700">worth going to</span> in Bangladesh.
          </h1>
        </div>

        {/* Subhead — three column asymmetric on desktop */}
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12">
          <p className="md:col-span-5 font-display text-xl leading-snug text-ink-700 md:text-2xl text-pretty">
            A curated weekly selection of workshops, talks, exhibitions, and quiet gatherings
            — chosen for craft, clarity, and community.
          </p>
          <div className="md:col-span-4 md:col-start-9 flex flex-col gap-4 text-sm text-ink-700">
            <p>
              Cholo Jai is a one-person newsroom for Dhaka's event landscape. No algorithm,
              no eventbrite clone — just a careful list of things we'd genuinely attend.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" variant="primary">
                <Link href="/events">
                  Browse all events
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/submit">Submit an event →</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick category shortcut chips */}
        <div className="mt-12 md:mt-20">
          <div className="hairline mb-5" />
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">Browse by</span>
            <Link
              href="/events"
              className="text-xs font-medium text-ink-500 hover:text-ink transition-colors"
            >
              See all categories →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredCats.map((c) => (
              <Link
                key={c.id}
                href={`/events?category=${c.slug}`}
                className="group inline-flex h-9 items-center rounded-full border border-rule bg-paper px-4 text-sm font-medium text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}