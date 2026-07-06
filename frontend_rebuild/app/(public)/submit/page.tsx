import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit/submit-form";

export const metadata: Metadata = {
  title: "Submit an event",
  description:
    "Running something fun in Dhaka? Tell us about it &mdash; we read every submission and publish within 48 hours if it fits.",
};

export default function SubmitPage() {
  return (
    <section className="bg-cream-50">
      <div className="editorial-container py-12 md:py-16">
        <SubmitForm />
      </div>
    </section>
  );
}