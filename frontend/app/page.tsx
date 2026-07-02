import Link from "next/link";
import { fetchEvents, fetchFeatured } from "@/lib/api";
import { categories, subAreas } from "@/lib/fallback-data";
import { EventCard } from "@/components/EventCard";
import { HeroEditorial } from "@/components/HeroEditorial";
import { WeekendForecast } from "@/components/WeekendForecast";
import { SectorExplorer } from "@/components/SectorExplorer";

export const revalidate = 60;

export default async function HomePage() {
  const [{ items: featured }, { items: upcoming }] = await Promise.all([
    fetchFeatured(),
    fetchEvents(),
  ]);

  const lead = featured[0] ?? upcoming[0];
  const featuredRest = featured.slice(1, 5);
  const recommended = upcoming.filter((e) => e.is_recommended || e.is_featured).slice(0, 3);
  const upcomingRest = upcoming.slice(0, 12);

  return (
    <div className="bg-paper">
      <HeroEditorial lead={lead} featured={featuredRest.slice(0, 3)} totalUpcoming={upcoming.length} />

      {/* Featured picks — bento grid */}
      <section className="mx-auto max-w-ed px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
        <header className="grid grid-cols-12 gap-6 mb-10 md:mb-14">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-4">Section 02 — Featured picks</div>
            <h2 className="t-huge text-ink">
              Hand-picked<br />
              <span className="font-serif italic text-accent">this week.</span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-5 flex md:items-end">
            <p className="font-serif text-lg text-ink/75 max-w-sm">
              A small, considered list of what&rsquo;s actually worth your
              calendar. Updated every Friday morning.
            </p>
          </div>
        </header>

        <FeaturedBento
          main={featuredRest[0]}
          tiles={featuredRest.slice(1, 4)}
        />

        <div className="mt-12 text-center">
          <Link href="/events" className="btn-ghost">
            See the full index
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Weekend forecast strip */}
      <WeekendForecast events={upcoming} />

      {/* Recommended for you */}
      {recommended.length > 0 && (
        <section className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24">
          <header className="grid grid-cols-12 gap-6 mb-10">
            <div className="col-span-12 md:col-span-5">
              <div className="eyebrow mb-4">Section 04 — For you</div>
              <h2 className="t-huge text-ink">
                Worth your<br />
                <span className="font-serif italic text-accent">attention.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-7 flex md:items-end">
              <p className="font-serif text-lg text-ink/75 max-w-md">
                Slightly curated by hand — smaller, intimate stuff we can&rsquo;t
                stop thinking about.
              </p>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommended.map((ev, i) => (
              <EventCard key={ev.id} ev={ev} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Categories bento */}
      <section className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24 border-t border-ink">
        <header className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-4">Section 05 — Browse</div>
            <h2 className="t-huge text-ink">
              Twelve categories.<br />
              <span className="font-serif italic text-accent">Pick your lane.</span>
            </h2>
          </div>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border border-ink">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/events?category=${c.slug}`}
              className="group relative aspect-[5/4] md:aspect-square border-r border-b border-ink last:border-r-0 bg-bone tile hover:bg-ink hover:text-ivory"
            >
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-accent text-lg transition-transform group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </div>
                <div>
                  <div className="font-display text-2xl md:text-3xl leading-[0.95] tracking-tight">
                    {c.name}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] opacity-50 group-hover:opacity-80">
                    Explore
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sectors — dark editorial */}
      <SectorExplorer sectors={subAreas.slice(0, 16)} />

      {/* Upcoming grid */}
      <section className="mx-auto max-w-ed px-5 md:px-8 py-16 md:py-24">
        <header className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-6">
            <div className="eyebrow mb-4">Section 07 — On deck</div>
            <h2 className="t-huge text-ink">
              Next up,<br />
              <span className="font-serif italic text-accent">chronologically.</span>
            </h2>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingRest.slice(0, 8).map((ev, i) => (
            <EventCard key={ev.id} ev={ev} index={i} />
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto max-w-ed px-5 md:px-8 py-20 md:py-28 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-9">
            <div className="eyebrow !text-ivory before:bg-accent mb-5">
              For organizers
            </div>
            <h3 className="t-huge">
              Run something in Dhaka?<br />
              <span className="font-serif italic text-accent">
                We&rsquo;ll handle the index.
              </span>
            </h3>
            <p className="mt-5 max-w-2xl text-ivory/85 font-serif text-lg leading-relaxed">
              Workshops, gigs, Iftar walks, weekend runs, exhibitions — if it&rsquo;s worth going
              to, send it our way. Listing is free, reviewed by hand, and goes live within 48 hours.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Link
              href="/submit"
              className="bg-accent text-ivory px-7 py-5 inline-flex items-center gap-2 font-semibold hover:bg-accent-2 transition-colors min-h-[52px]"
            >
              <span className="opacity-80">＋</span> Submit your event
            </Link>
          </div>
        </div>
        <div className="hazard-stripes h-2" aria-hidden />
      </section>
    </div>
  );
}

function FeaturedBento({
  main,
  tiles,
}: {
  main?: import("@/lib/types").EventItem;
  tiles: import("@/lib/types").EventItem[];
}) {
  if (!main) return null;
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Big feature card with poster + editorial split */}
      <Link
        href={`/events/${main.slug}`}
        className="col-span-12 lg:col-span-7 group block bg-ink text-ivory overflow-hidden focus-ring"
        aria-label={main.title}
      >
        <div className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main.poster_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover poster-treat transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute top-5 left-5 flex gap-2">
            <span className="chip-accent">★ Featured</span>
            {main.price_type === "free" && <span className="chip-ink !text-ivory !bg-accent !border-accent">● Free</span>}
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em]">
              {main.sub_area} · {formatTimeStr(main.start_time)}
            </div>
            <div className="font-display text-huge tracking-tighter text-ivory leading-none">
              {new Date(main.start_date).getDate().toString().padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            № 01
          </div>
          <div className="col-span-12 md:col-span-9">
            <h3 className="font-display text-huge tracking-tighter leading-[0.9] mb-4">
              {main.title}
            </h3>
            <p className="font-serif text-lg text-ivory/85 leading-relaxed line-clamp-3 max-w-2xl">
              {main.description}
            </p>
            <div className="mt-5 pt-4 border-t border-ivory/15 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
              <span>{main.outbound_button_label}</span>
              <span className="text-accent flex items-center gap-1.5">
                Read listing
                <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Three small tiles in a stacked column on the right */}
      <div className="col-span-12 lg:col-span-5 grid grid-cols-1 gap-6">
        {tiles.map((ev, i) => (
          <Link
            key={ev.id}
            href={`/events/${ev.slug}`}
            className="card group bg-bone overflow-hidden focus-ring"
          >
            <div className="grid grid-cols-12 gap-0">
              <div className="col-span-5 relative aspect-square overflow-hidden bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.poster_url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover poster-treat transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute top-0 left-0 bg-paper px-2 py-1 border-r border-b border-ink font-display text-xl leading-none">
                  {new Date(ev.start_date).getDate().toString().padStart(2, "0")}
                </div>
              </div>
              <div className="col-span-7 p-4 md:p-5 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/60 mb-2">
                    № 0{i + 2} · {ev.sub_area}
                  </div>
                  <h4 className="font-display text-lg md:text-xl tracking-tight leading-[0.95] group-hover:text-accent transition-colors">
                    {ev.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-accent font-semibold">
                    {formatTimeStr(ev.start_time)}
                  </span>
                  <span className="text-ink/60">
                    {ev.price_type === "free" ? "Free" : ev.price_note ?? "Paid"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatTimeStr(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = Number(h);
  const ampm = hh >= 12 ? "PM" : "AM";
  const hh12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hh12}:${m} ${ampm}`;
}