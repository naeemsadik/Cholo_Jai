import { AnalyticsView } from "@/components/admin/analytics-view";

export const metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return <AnalyticsView />;
}