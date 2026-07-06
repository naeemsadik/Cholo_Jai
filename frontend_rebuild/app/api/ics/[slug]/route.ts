import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const res = await getEventBySlug(params.slug);
  if (!res.data) {
    return new NextResponse("Not found", { status: 404 });
  }
  const e = res.data;
  const start = combineDateTime(e.start_date, e.start_time);
  const end = e.end_date && e.end_time
    ? combineDateTime(e.end_date, e.end_time)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ghurighuri//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@cholojai.bd`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.description.slice(0, 600))}\\n\\nMore info: ${e.outbound_link}`,
    `LOCATION:${escapeIcs(`${e.venue_name}, ${e.area_details}, ${e.sub_area}, ${e.city}`)}`,
    `URL:${e.outbound_link}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}

function combineDateTime(date: string, time: string): Date {
  // date: "2026-07-12", time: "10:00" → Date
  return new Date(`${date}T${time}:00+06:00`);
}

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}