import { EventCreateView } from "@/components/admin/event-create-view";
import { adminGetSettings } from "@/lib/api";

export const metadata = {
  title: "New event",
  robots: { index: false, follow: false },
};

// /admin/events/new — create a new event from the admin panel.
//
// Pre-fills the form with platform defaults from /api/settings (default
// city, default outbound label) so the editor doesn't have to think
// about them. The actual form is in components/admin/event-create-view.
export default async function AdminNewEventPage() {
  const settings = await adminGetSettings();
  return (
    <EventCreateView
      defaults={{
        default_outbound_label: settings.data?.default_outbound_label,
        default_city: settings.data?.default_city,
      }}
    />
  );
}
