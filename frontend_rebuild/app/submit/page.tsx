import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit/submit-form";

export const metadata: Metadata = {
  title: "Submit an event",
  description:
    "Run an event in Bangladesh? Submit it to Cholo Jai — we curate the best events in Dhaka and review every submission within 48 hours.",
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