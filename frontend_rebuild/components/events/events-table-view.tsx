import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatEventDate, formatTime, cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

// Dense tabular list view — matches the editorial print-index feel.
// Rows: № · Date · Listing · Sector · Category · Time · Type · →
const CATEGORY_PRETTY: Record<string, string> = {
  workshops: "Workshop",
  seminars: "Seminar",
  "university-events": "University",
  "student-events": "Student",
  "family-events": "Family",
  "weekend-events": "Weekend",
  concerts: "Concert",
  exhibitions: "Exhibition",
  "food-events": "Food",
  sports: "Sports",
  "islamic-community": "Community",
  "free-events": "Free",
};

function prettyCategory(slug?: string) {
  if (!slug) return "—";
  return CATEGORY_PRETTY[slug] ?? slug;
}

interface Props {
  events: Event[];
}

export function EventsTableView({ events }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-rule bg-paper shadow-paper">
      <table className="w-full text-sm">
        <thead className="border-b border-rule bg-cream-100 text-left">
          <tr>
            <th className="px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:px-4">
              №
            </th>
            <th className="px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:px-4">
              Date
            </th>
            <th className="px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:px-4">
              Listing
            </th>
            <th className="hidden px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:table-cell sm:px-4">
              Sector
            </th>
            <th className="hidden px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 lg:table-cell lg:px-4">
              Category
            </th>
            <th className="hidden px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:table-cell sm:px-4">
              Time
            </th>
            <th className="px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:px-4">
              Type
            </th>
            <th className="px-3 py-3 text-[0.65rem] font-mono uppercase tracking-[0.18em] text-ink-500 sm:px-4">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => {
            const isFree = e.price_type === "free";
            return (
              <tr
                key={e.id}
                className="border-b border-rule transition-colors last:border-b-0 hover:bg-cream-50"
              >
                <td className="px-3 py-3 font-display text-base tabular-nums text-ink-700 sm:px-4">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-3 py-3 font-mono text-xs uppercase tracking-wider text-ink-500 sm:px-4">
                  {formatEventDate(e.start_date).split(" · ")[0]}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <Link
                    href={`/events/${e.slug}`}
                    className="font-display text-base text-ink transition-colors hover:text-accent-700"
                  >
                    {e.title}
                  </Link>
                  {e.sub_area && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-500 sm:hidden">
                      {e.venue_name} · {e.sub_area}
                    </p>
                  )}
                </td>
                <td className="hidden px-3 py-3 text-sm text-ink-700 sm:table-cell sm:px-4">
                  {e.sub_area}
                </td>
                <td className="hidden px-3 py-3 text-[0.65rem] uppercase tracking-[0.15em] text-ink-500 lg:table-cell lg:px-4">
                  {prettyCategory(e.categories[0])}
                </td>
                <td className="hidden px-3 py-3 font-mono text-xs text-ink-700 sm:table-cell sm:px-4">
                  {formatTime(e.start_time)}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em]",
                      isFree
                        ? "bg-accent-50 text-accent-700"
                        : "bg-cream-200 text-ink-700",
                    )}
                  >
                    {isFree ? "Free" : "Paid"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right sm:px-4">
                  <Link
                    href={`/events/${e.slug}`}
                    aria-label={`Open ${e.title}`}
                    className="inline-flex items-center text-ink-500 transition-colors hover:text-ink"
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}