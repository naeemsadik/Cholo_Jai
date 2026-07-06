// Marquee strip — used as a section break, echoes the masthead feel of a print program.
// CSS-only animation, reduced-motion friendly. Scales text down on mobile so it
// reads as a soft brand band instead of dominating the page.
//
// `items` accepts a flat string array (legacy) or a localized array. When given
// bilingual entries the parent should pass already-localized strings.
export type MarqueeItem = string | { en: string; bn?: string };

export function Marquee({ items, locale }: { items: MarqueeItem[]; locale?: "en" | "bn" }) {
  const localized = items.map((it) =>
    typeof it === "string" ? it : (locale === "bn" && it.bn ? it.bn : it.en),
  );
  const loop = [...localized, ...localized, ...localized];
  return (
    <div className="overflow-hidden border-y border-rule bg-cream-100 py-3 md:py-4">
      <div
        className="flex shrink-0 animate-marquee gap-10 whitespace-nowrap motion-reduce:animate-none md:gap-12"
        aria-hidden
      >
        {loop.map((s, i) => (
          <span
            key={i}
            className="font-display text-base italic tracking-tight text-ink-700 md:text-2xl"
          >
            {s}
            <span className="mx-5 text-orange-500 md:mx-6">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
