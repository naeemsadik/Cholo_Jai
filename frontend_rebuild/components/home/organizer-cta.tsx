import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Friendly invite to organizers — used as section break
export function OrganizerCTA() {
  return (
    <section className="border-b border-rule bg-cream-50">
      <div className="editorial-container py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <span className="eyebrow">For organizers</span>
            <h2 className="mt-4 font-display text-display-md tracking-tight text-balance">
              Running something fun? Tell us about it.
            </h2>
            <p className="mt-5 max-w-xl text-ink-700 leading-relaxed">
              We read every submission. If it&rsquo;s a fit, we&rsquo;ll publish within 48
              hours. If it isn&rsquo;t, we&rsquo;ll tell you honestly &mdash; no vague
              &ldquo;we&rsquo;ll get back to you&rdquo;. Featured spots are reserved for
              folks we work with directly.
            </p>
          </div>
          <div className="md:col-span-5 md:flex md:justify-end">
            <Button asChild variant="primary" size="xl">
              <Link href="/submit">
                Submit your event
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}