import { SettingsView } from "@/components/admin/settings-view";

export const metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsView />;
}