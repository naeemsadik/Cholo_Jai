import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  ExternalLink,
  CalendarPlus,
  Mail,
  Phone,
  Instagram,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OutboundButton } from "@/components/events/outbound-button";
import { EventCard } from "@/components/events/event-card";
import { DataSourceProvider } from "@/components/site/data-source-context";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { ShareButtons } from "@/components/events/share-buttons";
import { StatusPill } from "@/components/admin/status-pill";
import { HorizontalSnap } from "@/components/mobile/horizontal-snap";
import { EventMobileActions } from "@/components/mobile/event-mobile-actions";
import { EventSchema, BreadcrumbSchema } from "@/components/seo/structured-data";
import { serverGetEventBySlug, serverGetEvents } from "@/lib/api.server";
import {
  formatEventDateWithLocale,
  formatPriceWithLocale,
  formatTimeWithLocale,
} from "@/lib/utils.server";
import { CATEGORIES, AUDIENCE_TAGS } from "@/lib/categories";
import { localizeEvent } from "@/lib/i18n/event";
import { getLocaleFromHeaders } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const live = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (live) return [];
  const events = await serverGetEvents({});
  return events.slice(0, 12).map((e) => ({ slug: e.slug }));
}

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [locale, e] = await Promise.all([
    getLocaleFromHeaders(),
    serverGetEventBySlug(params.slug),
  ]);

  if (!e) {
    return {
      title: "Event not found",
      description: "This event is no longer available.",
    };
  }

  const l = localizeEvent(e, locale);
  const price = formatPriceWithLocale(e.price_type, e.price_note, locale);
  const when = formatEventDateWithLocale(e.start_date, e.start_time, locale);
  const description = `${when} · ${l.venue_name}, ${e.sub_area} · ${price}. ${l.description.slice(0, 140)}…`;

  return {
    title: l.title,
    description,
    alternates: { canonical: `/events/${e.slug}` },
    openGraph: {
      type: "article",
      url: `/events/${e.slug}`,
      title: l.title,
      description: l.description.slice(0, 200),
      images: [{ url: e.poster_url, width: 1200, height: 630, alt: l.poster_alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: l.title,
      description,
      images: [e.poster_url],
    },
  };
}

export default async function EventDetailPage({ params, searchParams }: PageProps) {
  const locale = await getLocaleFromHeaders();
  const event = await serverGetEventBySlug(params.slug);
  if (!event) notFound();

  const l = localizeEvent(event, locale);
  const isFallback = !process.env.NEXT_PUBLIC_API_BASE_URL;
  const showAdminStatus = searchParams.preview === "admin";

  const allEvents = await serverGetEvents({});
  const related = allEvents
    .filter((e) => e.id !== event.id && event.categories.some((c) => e.categories.includes(c)))
    .slice(0, 3);

  const catName = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  const tagName = (slug: string) =>
    AUDIENCE_TAGS.find((t) => t.slug === slug)?.name ?? slug;

  return (
    <DataSourceProvider source={isFallback ? "fallback" : "live"}>
      <PageViewTracker eventId={event.id} />

      <EventSchema
        event={{
          ...event,
          title: l.title,
          description: l.description,
          venue_name: l.venue_name,
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "All events", url: "/events" },
          ...(event.categories[0]
            ? [{ name: catName(event.categories[0]), url: `/events?category=${event.categories[0]}` }]
            : []),
          { name: l.title, url: `/events/${event.slug}` },
        ]}
      />

      <article>
        <section className="border-b border-rule bg-cream-50">
          <div className="editorial-container pt-8 pb-10 md:pt-12 md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-xs text-ink-500">
              <Link href="/" className="hover:text-ink transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/events" className="hover:text-ink transition-colors">All events</Link>
              <ChevronRight className="h-3 w-3" />
              {event.categories[0] && (
                <>
                  <Link
                    href={`/events?category=${event.categories[0]}`}
                    className="hover:text-ink transition-colors capitalize"
                  >
                    {catName(event.categories[0])}
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
              <span className="text-ink line-clamp-1">{l.title}</span>
            </nav>

            <div className="grid gap-8 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  {showAdminStatus && (
                    <StatusPill status={event.status} featured={event.is_featured} />
                  )}
                  {event.is_featured && (
                    <Badge variant="ink">Curator's pick</Badge>
                  )}
                  {event.categories.map((c) => (
                    <Badge key={c} variant="outline">{catName(c)}</Badge>
                  ))}
                </div>
                <h1 className="mt-5 font-display text-display-lg tracking-tight text-balance">
                  {l.title}
                </h1>
                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-md">
                  <Row
                    label="When"
                    value={formatEventDateWithLocale(event.start_date, event.start_time, locale)}
                    mono
                  />
                  <Row
                    label="Where"
                    value={(
                      <span>
                        {l.venue_name}
                        <span className="block text-xs text-ink-500 mt-0.5">
                          {l.area_details}, {event.sub_area}
                        </span>
                      </span>
                    )}
                  />
                  <Row
                    label="Cost"
                    value={(
                      <span className="font-mono uppercase tracking-wider">
                        {formatPriceWithLocale(event.price_type, event.price_note, locale)}
                      </span>
                    )}
                  />
                  <Row
                    label="Organizer"
                    value={(
                      <span>
                        {event.organizer.name}
                        {event.organizer.social_link && (
                          <a
                            href={event.organizer.social_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center text-xs text-ink-500 hover:text-ink"
                          >
                            <Instagram className="h-3 w-3" />
                          </a>
                        )}
                      </span>
                    )}
                  />
                </div>
              </div>

              <div className="hidden md:col-span-5 md:block">
                <div className="sticky top-24 rounded-lg border border-rule bg-paper p-6 shadow-paper">
                  <div className="flex items-center gap-1.5 eyebrow">
                    <Calendar className="h-3 w-3" aria-hidden />
                    <time dateTime={event.start_date}>
                      {formatEventDateWithLocale(event.start_date, event.start_time, locale)}
                    </time>
                    {event.end_time && (
                      <span className="text-ink-400">— {formatTimeWithLocale(event.end_time, locale)}</span>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-2xl leading-tight tracking-tight text-pretty">
                    Looks like a plan?
                  </h2>
                  <p className="mt-2 text-sm text-ink-500">
                    We&rsquo;ll send you straight to the organizer&rsquo;s official page — registration,
                    tickets, or contact info, hosted by them.
                  </p>
                  <div className="mt-5">
                    <OutboundButton
                      event={event}
                      priceType={event.price_type}
                      priceNote={event.price_note}
                      size="lg"
                      variant="outbound"
                      className="w-full justify-center"
                    />
                  </div>
                  <p className="mt-3 text-[0.65rem] text-ink-400 font-mono uppercase tracking-wider">
                    Opens in a new tab · outbound click tracked
                  </p>
                  <Separator className="my-5" />
                  <ShareButtons
                    title={l.title}
                    slug={event.slug}
                    startDate={event.start_date}
                  />
                  <a
                    href={`/api/ics/${event.slug}`}
                    download
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-accent-700 transition-colors"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Add to calendar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-6 md:py-12">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-lg border border-rule bg-cream-200 md:aspect-[16/9]">
              <Image
                src={event.poster_url}
                alt={l.poster_alt}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="border-b border-rule bg-background">
          <div className="editorial-container py-12 md:py-16 thumb-zone md:pb-16">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-7">
                <span className="eyebrow">What&rsquo;s it about</span>
                <div className="prose mt-4 max-w-2xl font-display text-lg leading-relaxed text-ink text-pretty">
                  {l.description.split("\n").map((p, i) => (
                    <p key={i} className="mb-4">{p}</p>
                  ))}
                </div>

                {event.audience_tags && event.audience_tags.length > 0 && (
                  <div className="mt-10">
                    <span className="eyebrow">Good for</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.audience_tags.map((t) => (
                        <Badge key={t} variant="muted">{tagName(t)}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-12">
                  <span className="eyebrow">Organized by</span>
                  <div className="mt-3 rounded-lg border border-rule bg-paper p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl text-ink">{event.organizer.name}</h3>
                        {event.organizer.social_link && (
                          <a
                            href={event.organizer.social_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors"
                          >
                            <Instagram className="h-3 w-3" />
                            {prettyHandle(event.organizer.social_link)}
                          </a>
                        )}
                      </div>
                    </div>
                    {(event.organizer.email || event.organizer.phone) && (
                      <dl className="mt-4 grid gap-2 text-sm">
                        {event.organizer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-ink-400" />
                            <a href={`mailto:${event.organizer.email}`} className="text-ink hover:text-accent-700 transition-colors">
                              {event.organizer.email}
                            </a>
                          </div>
                        )}
                        {event.organizer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-ink-400" />
                            <a href={`tel:${event.organizer.phone}`} className="text-ink hover:text-accent-700 transition-colors">
                              {event.organizer.phone}
                            </a>
                          </div>
                        )}
                      </dl>
                    )}
                  </div>
                </div>
              </div>

              <aside className="md:col-span-4 md:col-start-9">
                <div className="sticky top-24 space-y-6">
                  <div className="rounded-lg border border-rule bg-paper p-5">
                    <span className="eyebrow">When</span>
                    <p className="mt-2 font-display text-lg text-ink">
                      {formatEventDateWithLocale(event.start_date, event.start_time, locale)}
                    </p>
                    {event.end_date && (
                      <p className="mt-1 text-sm text-ink-500">
                        Through {formatEventDateWithLocale(event.end_date, event.end_time ?? "00:00", locale)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-rule bg-paper p-5">
                    <span className="eyebrow">Where</span>
                    <p className="mt-2 font-display text-lg text-ink">{l.venue_name}</p>
                    <p className="mt-1 text-sm text-ink-500">{l.area_details}</p>
                    <p className="text-sm text-ink-500">{event.sub_area}, {event.city}</p>
                    {event.maps_link && (
                      <a
                        href={event.maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent-700 transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Open in Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="rounded-lg border border-rule bg-paper p-5">
                    <span className="eyebrow">Cost</span>
                    <p className="mt-2 font-display text-2xl text-ink">
                      {formatPriceWithLocale(event.price_type, event.price_note, locale)}
                    </p>
                    {event.price_note && event.price_type === "paid" && (
                      <p className="mt-1 text-sm text-ink-500">{event.price_note}</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-ink text-paper">
          <div className="editorial-container py-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <span className="eyebrow text-paper/60">
                  {event.outbound_button_label}
                </span>
                <h2 className="mt-4 font-display text-display-md tracking-tight text-balance">
                  Spots are limited. Head to the official page.
                </h2>
                <p className="mt-4 max-w-md text-paper/80 leading-relaxed">
                  We&rsquo;ll send you straight to {event.organizer.name}&rsquo;s official page.
                  Pay or register there — we don&rsquo;t handle any of that.
                </p>
              </div>
              <div className="md:col-span-4 md:col-start-9 md:flex md:justify-end">
                <OutboundButton
                  event={event}
                  priceType={event.price_type}
                  priceNote={event.price_note}
                  size="lg"
                  variant="primary"
                  className="bg-paper text-ink hover:bg-cream-100"
                />
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-rule bg-background">
            <div className="editorial-container py-16 md:py-20">
              <div className="mb-6 flex items-end justify-between px-4 md:mb-8 md:px-0">
                <div>
                  <span className="eyebrow">You might also like</span>
                  <h2 className="mt-3 font-display text-display-sm tracking-tight text-balance">
                    More {event.categories[0] ? catName(event.categories[0]).toLowerCase() : "events"} in Dhaka.
                  </h2>
                </div>
                <Link href="/events" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-accent-700 transition-colors">
                  See all →
                </Link>
              </div>
              <HorizontalSnap ariaLabel="Related events" itemWidth="min(85%, 320px)" showProgress>
                {related.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </HorizontalSnap>
              <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-3">
                {related.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </div>
          </section>
        )}

        <EventMobileActions event={event} />
      </article>
    </DataSourceProvider>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <>
      <dt className="eyebrow self-start pt-1">{label}</dt>
      <dd className={mono ? "text-ink font-mono" : "text-ink"}>{value}</dd>
    </>
  );
}

function prettyHandle(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, "").replace(/\/$/, "");
    return `@${path}`;
  } catch {
    return url;
  }
}
