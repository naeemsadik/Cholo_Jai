import { SubscribeForm } from "@/components/events/subscribe-form";

// Newsletter CTA strip — replaces the "Submit your event" and "Subscribe" hero CTA
export function NewsletterCTA() {
  return (
    <section className="bg-ink text-paper">
      <div className="editorial-container py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-6">
            <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-paper/60">
              The Friday dispatch
            </span>
            <h2 className="mt-4 font-display text-display-md tracking-tight text-balance text-paper">
              The week's best, sent Friday morning.
            </h2>
            <p className="mt-5 max-w-md text-paper/80 text-pretty leading-relaxed">
              Five hand-picked events. One short note. No tracking links, no promotional
              spam — just the things we'd actually go to ourselves.
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