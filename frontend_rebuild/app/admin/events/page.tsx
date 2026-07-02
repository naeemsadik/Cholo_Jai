import { AdminEvents } from "@/components/admin/admin-events";
import { AdminGate } from "@/components/admin/admin-gate";

export const metadata = {
  title: "Admin · Events",
  robots: { index: false, follow: false },
};

export default function AdminEventsPage() {
  return (
    <AdminGate>
      <AdminEvents />
    </AdminGate>
  );
}