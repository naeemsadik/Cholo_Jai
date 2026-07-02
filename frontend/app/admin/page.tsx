import { AdminShell } from "./AdminShell";
import { AdminOverview } from "./AdminOverview";

export default function AdminHomePage() {
  return (
    <AdminShell>
      <AdminOverview />
    </AdminShell>
  );
}