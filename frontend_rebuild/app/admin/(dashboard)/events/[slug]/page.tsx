import { EventEditView } from "@/components/admin/event-edit-view";

interface PageProps {
  params: { slug: string };
}

export const metadata = {
  title: "Edit event",
  robots: { index: false, follow: false },
};

// The event edit view identifies events by ID for mutation safety.
// The route uses [slug] for human-readable URLs and looks up the matching ID
// from the admin events listing before rendering.
export default function AdminEditEventPage({ params }: PageProps) {
  return <EventEditView slug={params.slug} />;
}