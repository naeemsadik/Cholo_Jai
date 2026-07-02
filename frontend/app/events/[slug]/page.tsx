import { fetchEventBySlug, fetchEvents } from "@/lib/api";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventDetail } from "./EventDetail";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { item } = await fetchEventBySlug(params.slug);
  if (!item) return { title: "Not found · Cholo Jai" };
  return {
    title: `${item.title} · Cholo Jai`,
    description: item.description.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.description.slice(0, 200),
      images: item.poster_url ? [{ url: item.poster_url }] : undefined,
    },
  };
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const { item } = await fetchEventBySlug(params.slug);
  if (!item) return notFound();

  const { items: related } = await fetchEvents({ category: item.categories[0] });
  const relatedFiltered = related.filter((e) => e.slug !== item.slug).slice(0, 3);

  return <EventDetail ev={item} related={relatedFiltered} />;
}