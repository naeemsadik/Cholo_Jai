import { CmsListView } from "@/components/admin/cms-list-view";

export const metadata = {
  title: "CMS pages",
  robots: { index: false, follow: false },
};

export default function AdminCmsListPage() {
  return <CmsListView />;
}
