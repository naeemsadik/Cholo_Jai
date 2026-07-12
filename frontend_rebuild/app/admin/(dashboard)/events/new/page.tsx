import { EventCreateView } from "@/components/admin/event-create-view";

export const metadata = {
  title: "New event",
  robots: { index: false, follow: false },
};

// /admin/events/new — create a new event from the admin panel.
//
// Pre-fills the form with platform defaults from /api/settings (default
// city, default outbound label) so the editor doesn't have to think
// about them. The actual form is in components/admin/event-create-view.
export default function AdminNewEventPage() {
  return <EventCreateView />;
}
