import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="editorial-container flex flex-col items-center justify-center py-32 text-center">
      <span className="eyebrow">404</span>
      <h1 className="mt-4 font-display text-display-md tracking-tight text-balance">
        We couldn't find that page.
      </h1>
      <p className="mt-4 max-w-md text-ink-500 leading-relaxed">
        The link may be old, the event may have been removed, or you may have
        mistyped something. Head home and find something worth going to.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/events">Browse events</Link>
        </Button>
      </div>
    </div>
  );
}