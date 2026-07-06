import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, isWeekendDate } from "@/lib/utils";
import {
  formatEventDateWithLocale,
  formatTimeWithLocale,
} from "@/lib/utils.server";
import { tCategory, tSubArea } from "@/lib/categories";
import { localizeEvent } from "@/lib/i18n/event";
import { getLocaleFromHeaders, getDictionary } from "@/lib/i18n/server";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  variant?: "default" | "horizontal" | "compact" | "feature";
  className?: string;
}

export async function EventCard({ event, variant = "default", className }: EventCardProps) {
  const locale = await getLocaleFromHeaders();
  return <EventCardInner event={event} variant={variant} className={className} locale={locale} />;
}

// Inner (sync) card — receives the resolved locale. We split this off so
// child variants (FeatureCard, etc.) can re-use it without re-awaiting
// the locale.
function EventCardInner({
  event,
  variant = "default",
  className,
  locale,
}: EventCardProps & { locale: import("@/lib/i18n/types").Locale }) {
  const dict = getDictionary(locale);
  const isWeekend = isWeekendDate(event.start_date);
  const isFree = event.price_type === "free";
  const l = localizeEvent(event, locale);

  if (variant === "feature") {
    return <FeatureCard event={event} className={className} locale={locale} l={l} />;
  }
  if (variant === "horizontal") {
    return <HorizontalCard event={event} className={className} locale={locale} l={l} />;
  }
  if (variant === "compact") {
    return <CompactCard event={event} className={className} locale={locale} l={l} />;
  }

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-rule bg-paper transition-all duration-300",
        "hover:border-ink-300 hover:-translate-y-0.5 hover:shadow-paper-lg",
        className,
      )}
    >
      <Link
        href={`/events/${event.slug}`}
        className="absolute inset-0 z-10"
        aria-label={l.title}
      >
        <span className="sr-only">{l.title}</span>
      </Link>

      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <Image
          src={event.poster_url}
          alt={l.poster_alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {event.is_featured && (
            <Badge variant="ink" className="backdrop-blur-sm">{dict.home.curatorsPick}</Badge>
          )}
          {isWeekend && (
            <Badge variant="outline" className="bg-paper/90 backdrop-blur-sm">{dict.nav.thisWeekend}</Badge>
          )}
          {isFree && (
            <Badge variant="outline" className="bg-paper/90 backdrop-blur-sm">{dict.home.freeEntryBadge}</Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge variant="ink" className="bg-paper/95 text-ink">
            {formatPrice(event.price_type, event.price_note, locale)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-w-0 items-center gap-2 text-[0.6875rem] uppercase tracking-[0.15em] text-ink-500">
          <Calendar className="h-3 w-3 shrink-0" />
          <time dateTime={event.start_date} className="truncate">
            {formatEventDateWithLocale(event.start_date, event.start_time, locale)}
          </time>
        </div>
        <h3 className="mt-3 break-words font-display text-xl leading-snug text-balance text-ink line-clamp-2">
          {l.title}
        </h3>
        <p className="mt-2 line-clamp-2 break-words text-sm text-ink-500">
          {l.description}
        </p>

        <div className="mt-auto pt-4">
          <div className="hairline mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink-700">
              <MapPin className="h-3 w-3 shrink-0 text-ink-500" />
              <span className="truncate">{tSubArea(event.sub_area, locale)}, {event.city}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {event.categories.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="whitespace-nowrap rounded-sm bg-cream-200 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-ink-700"
                >
                  {tCategory(c, locale)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeatureCard({
  event,
  className,
  locale,
  l,
}: {
  event: Event;
  className?: string;
  locale: import("@/lib/i18n/types").Locale;
  l: ReturnType<typeof localizeEvent>;
}) {
  const dict = getDictionary(locale);
  const isFree = event.price_type === "free";
  return (
    <article
      className={cn(
        "group relative grid grid-cols-1 overflow-hidden border border-rule bg-paper transition-all duration-300 md:grid-cols-12",
        "hover:border-ink-300 hover:shadow-paper-lg",
        className,
      )}
    >
      <Link href={`/events/${event.slug}`} className="absolute inset-0 z-10" aria-label={l.title}>
        <span className="sr-only">{l.title}</span>
      </Link>

      <div className="relative aspect-[16/10] overflow-hidden bg-cream-200 md:col-span-7 md:aspect-auto md:h-full">
        <Image
          src={event.poster_url}
          alt={l.poster_alt}
          fill
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge variant="ink" className="bg-ink text-paper">{dict.home.curatorsPick}</Badge>
          {isFree && (
            <Badge variant="outline" className="bg-paper/90">{dict.home.freeEntryBadge}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between p-7 md:col-span-5 md:p-10">
        <div>
          <div className="eyebrow">
            {dict.home.curatorsPick} · {tCategory(event.categories[0] ?? "", locale)}
          </div>
          <h3 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-balance text-ink md:text-4xl">
            {l.title}
          </h3>
          <p className="mt-4 line-clamp-4 text-ink-700 leading-relaxed">{l.description}</p>
        </div>
        <div className="mt-8">
          <div className="hairline mb-4" />
          <dl className="grid grid-cols-2 gap-y-3 text-xs text-ink-500">
            <dt className="eyebrow">{dict.home.whenLabel}</dt>
            <dd className="text-ink">
              <time dateTime={event.start_date}>
                {formatEventDateWithLocale(event.start_date, event.start_time, locale)}
              </time>
            </dd>
            <dt className="eyebrow">{dict.home.whereLabel}</dt>
            <dd className="text-ink">
              {l.venue_name}, {tSubArea(event.sub_area, locale)}
            </dd>
            <dt className="eyebrow">{dict.home.costLabel}</dt>
            <dd className="font-mono uppercase tracking-wider text-ink">
              {formatPrice(event.price_type, event.price_note, locale)}
            </dd>
          </dl>
        </div>
      </div>
    </article>
  );
}

function HorizontalCard({
  event,
  className,
  locale,
  l,
}: {
  event: Event;
  className?: string;
  locale: import("@/lib/i18n/types").Locale;
  l: ReturnType<typeof localizeEvent>;
}) {
  const dict = getDictionary(locale);
  return (
    <article
      className={cn(
        "group relative grid h-full w-full min-w-0 grid-cols-12 gap-3 overflow-hidden rounded-lg border border-rule bg-paper p-4 transition-colors hover:border-ink-300 hover:bg-cream-50 sm:gap-4",
        className,
      )}
    >
      <Link href={`/events/${event.slug}`} className="absolute inset-0 z-10" aria-label={l.title}>
        <span className="sr-only">{l.title}</span>
      </Link>

      <div className="col-span-3 min-w-0 sm:col-span-2">
        <time
          dateTime={event.start_date}
          className="block font-display text-xl leading-none tabular-nums"
        >
          <span className="block text-3xl text-ink">
            {new Date(event.start_date).getDate()}
          </span>
          <span className="mt-1 block truncate text-[0.65rem] font-medium uppercase tracking-wider text-ink-500">
            {dict.calendar.monthsShort[new Date(event.start_date).getMonth()]}
          </span>
        </time>
      </div>

      <div className="col-span-9 min-w-0 sm:col-span-7">
        <h3 className="line-clamp-2 break-words font-display text-base text-ink group-hover:text-accent-700 sm:text-xl transition-colors">
          {l.title}
        </h3>
        <p className="mt-1 line-clamp-2 break-words text-xs text-ink-500 sm:text-sm">{l.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-ink-500 sm:gap-x-3 sm:text-xs">
          <span className="truncate">{tSubArea(event.sub_area, locale)}, {event.city}</span>
          <span aria-hidden>·</span>
          <span className="font-mono uppercase">{formatTimeWithLocale(event.start_time, locale)}</span>
          {event.categories[0] && (
            <>
              <span aria-hidden>·</span>
              <span className="uppercase tracking-wider">{tCategory(event.categories[0], locale)}</span>
            </>
          )}
        </div>
      </div>

      <div className="col-span-12 flex items-center justify-end sm:col-span-3">
        <span
          className={cn(
            "whitespace-nowrap rounded-sm px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider",
            event.price_type === "free" ? "bg-accent-50 text-accent-700" : "bg-cream-200 text-ink-700",
          )}
        >
          {formatPrice(event.price_type, event.price_note, locale)}
        </span>
      </div>
    </article>
  );
}

function CompactCard({
  event,
  className,
  locale,
  l,
}: {
  event: Event;
  className?: string;
  locale: import("@/lib/i18n/types").Locale;
  l: ReturnType<typeof localizeEvent>;
}) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group flex items-start gap-4 py-4 border-b border-rule transition-colors hover:bg-cream-50",
        className,
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-cream-200">
        <Image src={event.poster_url} alt="" fill className="object-cover" sizes="64px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-500">
          {formatEventDateWithLocale(event.start_date, undefined, locale)}
        </p>
        <h4 className="mt-1 font-display text-base leading-snug text-ink group-hover:text-accent-700 transition-colors line-clamp-2">
          {l.title}
        </h4>
        <p className="mt-1 text-xs text-ink-500">{l.venue_name}, {tSubArea(event.sub_area, locale)}</p>
      </div>
    </Link>
  );
}
