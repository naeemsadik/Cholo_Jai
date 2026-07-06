import { AdminEvents } from "@/components/admin/admin-events";

export const metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

export default function AdminEventsPage() {
  return <AdminEvents />;
}