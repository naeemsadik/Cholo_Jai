import { SubmissionsList } from "@/components/admin/submissions-list";

export const metadata = {
  title: "Submissions",
  robots: { index: false, follow: false },
};

export default function AdminSubmissionsPage() {
  return <SubmissionsList />;
}