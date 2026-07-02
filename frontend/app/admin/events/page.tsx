import { AdminShell } from "../AdminShell";
import { EventsAdminView } from "./EventsAdminView";

export default function EventsAdminPage() {
  return (
    <AdminShell>
      <EventsAdminView />
    </AdminShell>
  );
}