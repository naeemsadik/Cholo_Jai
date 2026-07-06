import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/categories";

// Editorial hero — designed to feel like a friendly invite from a friend who
// always knows what's on, NOT a generic SaaS hero.
export function Hero({ upcomingCount }: { upcomingCount: number }) {
  const featuredCats = CATEGORIES.slice(0, 6);
  return (
    <section className="relative overflow-hidden border-b border-rule bg-cream-50">
      <div className="editorial-container relative pb-16 pt-12 md:pb-24 md:pt-20">
        {/* Top eyebrow + tag */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="ink" className="font-mono">
              THIS WEEK
            </Badge>
            <span className="eyebrow">Dhaka · hand-picked</span>
          </div>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-wider">
            {upcomingCount} things worth stepping out for
          </p>
        </div>

        {/* Friendly headline */}
        <div className="mt-10 md:mt-16">
          <h1 className="font-display text-display-xl font-medium tracking-tight text-balance">
            Hey, wanna go <span className="italic text-orange-700">somewhere</span>?
          </h1>
        </div>

        {/* Subhead — three column asymmetric on desktop */}
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12">
          <p className="md:col-span-5 font-display text-xl leading-snug text-ink-700 md:text-2xl text-pretty">
            Ghurighuri is your friend who always knows what&rsquo;s happening
            around the city. Concerts, cafés, workshops, weekend markets &mdash; the
            good stuff, picked for you.
          </p>
          <div className="md:col-span-4 md:col-start-9 flex flex-col gap-4 text-sm text-ink-700">
            <p>
              No algorithm. No eventbrite clutter. Just a careful weekly list of things
              we&rsquo;d actually go to ourselves &mdash; submitted by organizers, then
              verified by humans.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" variant="primary">
                <Link href="/events">
                  See what&rsquo;s on
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/submit">Got an event? Tell us →</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick category shortcut chips */}
        <div className="mt-12 md:mt-20">
          <div className="hairline mb-5" />
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">In the mood for</span>
            <Link
              href="/events"
              className="text-xs font-medium text-ink-500 hover:text-ink transition-colors"
            >
              See everything →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredCats.map((c) => (
              <Link
                key={c.id}
                href={`/events?category=${c.slug}`}
                className="group inline-flex h-9 items-center rounded-full border border-rule bg-paper px-4 text-sm font-medium text-ink transition-all hover:border-orange-500 hover:bg-orange-500 hover:text-white"
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