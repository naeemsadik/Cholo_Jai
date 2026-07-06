import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: { absolute: "Dashboard · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}