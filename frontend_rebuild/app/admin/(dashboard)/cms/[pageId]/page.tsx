import { CmsPageEditor } from "@/components/admin/cms-page-editor";

export const metadata = {
  title: "Edit CMS page",
  robots: { index: false, follow: false },
};

export default function AdminCmsPageEditPage({
  params,
}: {
  params: { pageId: string };
}) {
  return <CmsPageEditor pageId={params.pageId} />;
}
