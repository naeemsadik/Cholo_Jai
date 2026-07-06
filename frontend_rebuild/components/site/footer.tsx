import Link from "next/link";
import { Instagram, Facebook, Mail, ArrowUpRight, ChevronDown } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { SubscribeForm } from "@/components/events/subscribe-form";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-rule bg-cream-50 md:mt-32">
      <div className="editorial-container pb-10 pt-10 md:pb-12 md:pt-16">
        {/* Top — masthead. Mobile order: Subscribe → social → logo/links.
            Desktop: 4-col grid as before. */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Logo block — desktop position; mobile shows below subscribe */}
          <div className="order-2 hidden md:order-1 md:col-span-4 md:block">
            <Logo />
            <p className="mt-6 max-w-md font-display text-2xl leading-snug tracking-tight text-balance">
              Discover. Explore. Experience.
            </p>
            <p className="mt-2 max-w-md text-sm text-ink-500 leading-relaxed">
              Concerts, cafés, workshops, weekend markets, and quiet corners worth
              stepping out for &mdash; across Dhaka.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="https://instagram.com/ghurighuri"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://facebook.com/ghurighuri"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Link>
              <Link
                href="mailto:hello@ghurighuri.bd"
                className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 h-10 text-sm hover:border-ink transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Link>
            </div>
          </div>

          {/* Subscribe block — first interactive element on mobile */}
          <div className="order-1 md:order-2 md:col-span-4">
            <h3 className="eyebrow">Stay in the loop</h3>
            <p className="mt-3 text-sm text-ink-500">
              The Friday Dispatch &mdash; five things worth stepping out for, and one short note from us. No spam.
            </p>
            <div className="mt-4">
              <SubscribeForm />
            </div>

            {/* Social on mobile — inline, after subscribe */}
            <div className="mt-6 flex flex-wrap items-center gap-3 md:hidden">
              <Link
                href="https://instagram.com/ghurighuri"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper text-ink transition-colors hover:border-ink"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://facebook.com/ghurighuri"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper text-ink transition-colors hover:border-ink"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:hello@ghurighuri.bd"
                aria-label="Email"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-paper text-ink transition-colors hover:border-ink"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Discover — collapsible on mobile via native <details> */}
          <details className="order-3 border-t border-rule pt-4 md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base text-ink">
              Discover
              <ChevronDown className="h-4 w-4 text-ink-500" />
            </summary>
            <ul className="mt-3 space-y-2 pb-2 text-sm">
              <li><Link href="/events" className="text-ink hover:text-accent-500 transition-colors">All events</Link></li>
              <li><Link href="/events?weekend=true" className="text-ink hover:text-accent-500 transition-colors">This weekend</Link></li>
              <li><Link href="/events?featured=true" className="text-ink hover:text-accent-500 transition-colors">Featured</Link></li>
              <li><Link href="/events?price=free" className="text-ink hover:text-accent-500 transition-colors">Free entry</Link></li>
              <li><Link href="/events?when=today" className="text-ink hover:text-accent-500 transition-colors">Today</Link></li>
            </ul>
          </details>
          <div className="order-3 hidden md:order-2 md:col-span-2 md:block">
            <h3 className="eyebrow">Discover</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/events" className="text-ink hover:text-accent-500 transition-colors">All events</Link></li>
              <li><Link href="/events?weekend=true" className="text-ink hover:text-accent-500 transition-colors">This weekend</Link></li>
              <li><Link href="/events?featured=true" className="text-ink hover:text-accent-500 transition-colors">Featured</Link></li>
              <li><Link href="/events?price=free" className="text-ink hover:text-accent-500 transition-colors">Free entry</Link></li>
            </ul>
          </div>

          <details className="order-4 border-t border-rule pt-4 md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base text-ink">
              Organizers
              <ChevronDown className="h-4 w-4 text-ink-500" />
            </summary>
            <ul className="mt-3 space-y-2 pb-2 text-sm">
              <li><Link href="/submit" className="text-ink hover:text-accent-500 transition-colors">Submit an event</Link></li>
              <li><Link href="/about#organizers" className="text-ink hover:text-accent-500 transition-colors">For organizers</Link></li>
              <li><Link href="/admin" className="text-ink hover:text-accent-500 transition-colors">Admin</Link></li>
            </ul>
          </details>
          <div className="order-4 hidden md:order-2 md:col-span-2 md:block">
            <h3 className="eyebrow">Organizers</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link href="/submit" className="text-ink hover:text-accent-500 transition-colors">Submit an event</Link></li>
              <li><Link href="/about#organizers" className="text-ink hover:text-accent-500 transition-colors">For organizers</Link></li>
              <li><Link href="/admin" className="text-ink hover:text-accent-500 transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        {/* Colophon */}
        <div className="hairline mt-10 md:mt-16" />
        <div className="flex flex-col-reverse gap-3 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Ghurighuri. Your next stop for ghurighuri &mdash; curated in Dhaka, with love.
          </p>
          <p className="text-xs text-ink-500 font-mono uppercase tracking-wider">
            Made in Dhaka · v2.0
          </p>
        </div>
      </div>
    </footer>
  );
}