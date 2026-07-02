import Link from "next/link";
import { Instagram, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/site/logo";

export function Footer() {
  return (
    <footer className="mt-24 md:mt-32 border-t border-rule bg-cream-50">
      <div className="editorial-container pt-16 pb-12">
        {/* Top — masthead */}
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-6 max-w-md font-display text-2xl leading-snug tracking-tight text-balance">
              Find events worth going to — workshops, talks, weekend markets, and quiet gatherings, across Dhaka.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="https://instagram.com/cholojai"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://facebook.com/cholojai"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Link>
              <Link
                href="mailto:hello@cholojai.bd"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="eyebrow">Discover</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/events" className="text-ink hover:text-accent-500 transition-colors">All events</Link></li>
              <li><Link href="/events?weekend=true" className="text-ink hover:text-accent-500 transition-colors">This weekend</Link></li>
              <li><Link href="/events?featured=true" className="text-ink hover:text-accent-500 transition-colors">Featured</Link></li>
              <li><Link href="/events?price=free" className="text-ink hover:text-accent-500 transition-colors">Free entry</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="eyebrow">Organizers</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/submit" className="text-ink hover:text-accent-500 transition-colors">Submit an event</Link></li>
              <li><Link href="/about#organizers" className="text-ink hover:text-accent-500 transition-colors">For organizers</Link></li>
              <li><Link href="/admin" className="text-ink hover:text-accent-500 transition-colors">Admin</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="eyebrow">About</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/about" className="text-ink hover:text-accent-500 transition-colors">About Cholo Jai</Link></li>
              <li><Link href="/about#curation" className="text-ink hover:text-accent-500 transition-colors">How we curate</Link></li>
              <li>
                <Link href="https://instagram.com/cholojai" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-ink hover:text-accent-500 transition-colors">
                  DM us on Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Colophon */}
        <div className="hairline mt-16" />
        <div className="flex flex-col-reverse gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Cholo Jai. A curated events discovery for Bangladesh.
          </p>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-wider">
            Made in Dhaka · v2.0
          </p>
        </div>
      </div>
    </footer>
  );
}