import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-ed px-5 md:px-8 py-24 md:py-40 text-center">
        <div className="eyebrow !justify-center mb-4">Status · 404 · Route not found</div>
        <h1 className="font-display mega tracking-tighter kern-tight leading-[0.85] mb-6">
          Off-grid<span className="font-serif italic text-accent">.</span>
        </h1>
        <p className="font-serif text-lg max-w-md mx-auto mb-8 text-ink/80 leading-relaxed">
          That listing doesn&rsquo;t exist (yet), has been archived, or was a
          typo in the URL. Try the full index instead.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="btn-primary">◂ Back to home</Link>
          <Link href="/events" className="btn-accent">▦ Full index</Link>
        </div>
      </div>
    </section>
  );
}