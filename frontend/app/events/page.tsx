import { Suspense } from "react";
import { EventsListing } from "./EventsListing";

export const revalidate = 60;

export const metadata = {
  title: "Index · All Events — Cholo Jai",
  description: "The full curated index of events in Dhaka. Filter by date, sector, category, and tag.",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono uppercase tracking-[0.2em]">Loading index…</div>}>
      <EventsListing />
    </Suspense>
  );
}