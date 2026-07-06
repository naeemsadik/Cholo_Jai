import { SubmissionReview } from "@/components/admin/submission-review";

interface PageProps {
  params: { id: string };
}

export const metadata = {
  title: "Review submission",
  robots: { index: false, follow: false },
};

export default function AdminSubmissionReviewPage({ params }: PageProps) {
  return <SubmissionReview id={params.id} />;
}