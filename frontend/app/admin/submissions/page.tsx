import { AdminShell } from "../AdminShell";
import { SubmissionsView } from "./SubmissionsView";

export default function SubmissionsAdminPage() {
  return (
    <AdminShell>
      <SubmissionsView />
    </AdminShell>
  );
}