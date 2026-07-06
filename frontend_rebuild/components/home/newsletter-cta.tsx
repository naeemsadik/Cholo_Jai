import { SubscribeForm } from "@/components/events/subscribe-form";

// Friday dispatch — friendly invite to subscribe
export function NewsletterCTA() {
  return (
    <section className="bg-ink text-paper">
      <div className="editorial-container py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-6">
            <span className="eyebrow text-paper/60">
              The Friday dispatch
            </span>
            <h2 className="mt-4 font-display text-display-md tracking-tight text-balance text-paper">
              Five things worth stepping out for, every Friday.
            </h2>
            <p className="mt-5 max-w-md text-paper/80 text-pretty leading-relaxed">
              Five things worth your weekend, and one short note from us &mdash;
              the kind of stuff we&rsquo;d actually go to ourselves. Nothing else.
              No listicles, no ads, no upsells.
            </p>
          </div>
          <div className="md:col-span-6 md:flex md:items-center">
            <SubscribeForm className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}