import { AdminShell } from "../AdminShell";
import { SettingsView } from "./SettingsView";

export default function SettingsAdminPage() {
  return (
    <AdminShell>
      <SettingsView />
    </AdminShell>
  );
}