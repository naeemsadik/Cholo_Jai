// Marquee strip — used as a section break, echoes the masthead feel of a print program.
// CSS-only animation, reduced-motion friendly.
export function Marquee({ items }: { items: string[] }) {
  // Duplicate so the loop is seamless
  const loop = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-rule bg-cream-50 py-4">
      <div
        className="flex shrink-0 animate-marquee gap-12 whitespace-nowrap motion-reduce:animate-none"
        aria-hidden
      >
        {loop.map((s, i) => (
          <span key={i} className="font-display text-2xl italic tracking-tight text-ink-700">
            {s}
            <span className="mx-6 text-ink-400">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}