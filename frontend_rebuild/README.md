# Ghurighuri — Frontend (v2 rebuild)

A complete rebuild of the Ghurighuri frontend in Next.js 14 (App Router), TypeScript, and Tailwind, using an editorial visual system distinct from generic eventbrite-style templates.

> **Your next stop for ghurighuri** — discover. explore. experience.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Design system

The design follows an editorial print-magazine direction — warm cream backgrounds, a distinctive serif display face (Fraunces), high information density, and sparing use of color. Bangladesh flag colors (green + red) are reserved for: the green logo accent and category hints; the red ember tone is used **only** for the outbound "go to event" CTA.

- **Background:** `#FAF7F2` (warm cream / "newsprint")
- **Ink:** `#1A1A1A`
- **Accent green:** `#006A4E` (Bangladesh green, used like a single drop of color)
- **Ember red:** `#C8341B` (reserved for outbound CTA)
- **Fonts:** Fraunces (display), Inter (body), Hind Siliguri (Bengali), JetBrains Mono (dates)

## Architecture

```
app/
  page.tsx                Homepage (ISR, revalidate 5m)
  events/page.tsx         Listing with URL-synced filters
  events/[slug]/page.tsx  Event detail (SSG, per-event OG metadata)
  submit/page.tsx         Organizer submission form (4-step)
  about/page.tsx          About / curatorial philosophy
  admin/page.tsx          Admin login
  admin/events/page.tsx   Curation dashboard (events + submissions)
  api/ics/[slug]/route.ts Add-to-calendar (.ics) endpoint

components/
  ui/                     Button, Input, Card, Sheet, Tabs, Toast, etc.
  site/                   Nav, Footer, Logo, SiteShell
  home/                   Hero, WeekendForecast, UpcomingGrid, etc.
  events/                 EventCard, FilterBar, OutboundButton, ShareButtons
  submit/                 SubmitForm (multi-step)
  admin/                  AdminLogin, AdminEvents, AdminGate

lib/
  types.ts                Mirrors PRD §8.3
  categories.ts           Categories, audience tags, sub-areas
  fallback-data.ts        18 realistic sample events (Dhaka)
  api.ts                  Fetch with timeout → fallback
  utils.ts                Date formatting, cn(), filter URL sync
```

## Backend integration

All API calls go through `lib/api.ts`, which:
- Reads `NEXT_PUBLIC_API_BASE_URL` from `.env.local`
- Times out at 4s, then falls back to `lib/fallback-data.ts`
- Returns `{ data, source: "live" | "fallback" }` so UI can show a subtle banner
- Suppresses analytics on fallback-rendered content (per PRD §8.6)

## Pages & SEO

- **ISR** on listing + homepage (revalidate 300s)
- **SSG** on event detail (paths generated from fallback data at build)
- **Per-event Open Graph** + Twitter card metadata
- **JSON-LD** event schema recommended in next iteration
- **Sitemap** auto-generated from events at `/sitemap.xml`
- **Robots** disallows `/admin` and `/api/` at `/robots.txt`

## Mobile-first

- 44px minimum touch targets on all interactive elements
- Sheet-based filter UI on mobile, sidebar on desktop
- Sticky outbound CTA card on event detail
- All cards have hover lift + transition

## Accessibility

- Visible focus rings (`:focus-visible`)
- Reduced-motion respected (animations disabled via `prefers-reduced-motion`)
- Semantic HTML (`<article>`, `<nav>`, `<dl>`)
- Color contrast ≥ 4.5:1 throughout
- All icon-only buttons have `aria-label`

## Known follow-ups

- Admin dashboard: actions (publish/unpublish/approve/reject) are visual-only; wire to backend
- ICS endpoint doesn't respect Dhaka timezone yet
- Add JSON-LD `Event` schema to detail pages
- Add `/api/analytics/*` route handlers (currently no-op, calls go to backend)
- Wire real auth (JWT) instead of sessionStorage token