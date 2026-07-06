// A short editorial sidebar — what's the curatorial philosophy, in three beats.
import { CATEGORIES } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";

export function Manifesto() {
  return (
    <section className="border-b border-rule bg-background">
      <div className="editorial-container py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="eyebrow">Editor's note</span>
            <h2 className="mt-4 font-display text-display-md tracking-tight text-balance">
              Why curated, not exhaustive.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-ink-700 leading-relaxed">
            <p>
              Dhaka has more going on than anyone could ever keep up with. We&rsquo;re
              not trying to list all of it &mdash; we&rsquo;re trying to surface the
              stuff worth showing up for. Small workshops over big corporate
              conferences, neighborhood gatherings over mass festivals, paid work that
              respects its makers, free events that respect their audiences.
            </p>
            <p>
              Every event here is checked by a human. We confirm the venue, verify
              the organizer, and pull the listing if anything looks off. If something&rsquo;s
              off about a listing,{" "}
              <a className="editorial-link" href="mailto:hello@ghurighuri.bd">
                drop us a line
              </a>{" "}
              &mdash; we&rsquo;ll fix it the same day.
            </p>
            <div className="pt-4 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 8).map((c) => (
                <Badge key={c.id} variant="muted">{c.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}