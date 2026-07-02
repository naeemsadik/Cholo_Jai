import { AdminShell } from "../../AdminShell";
import { EventEditView } from "./EventEditView";

export default function EventEditPage({ params }: { params: { slug: string } }) {
  return (
    <AdminShell>
      <EventEditView slug={params.slug} />
    </AdminShell>
  );
}