import { HomeControlsView } from "@/components/admin/home-controls-view";

export const metadata = {
  title: "Home page",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <HomeControlsView />;
}
