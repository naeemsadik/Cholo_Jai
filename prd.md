# Cholo Jai — Product Requirements Document (v1.0)

**Product:** Cholo Jai
**Initial Market:** Bangladesh
**Initial Launch City:** Dhaka
**MVP Duration:** 30 days
**Primary Channel:** Instagram
**Tech Stack:** Next.js (frontend) + FastAPI (backend)
**Ticketing / User Accounts / Organizer Dashboard:** Out of scope for MVP

---

## 1. MVP Summary

Cholo Jai MVP v1 is a 30-day validation sprint for a curated event discovery platform in Bangladesh, starting with Dhaka.

The MVP uses Instagram as the primary discovery channel and a lightweight, mobile-first Next.js website as the structured event discovery layer, backed by a FastAPI service.

**Users can:**
- Discover curated events
- Browse events by date, city, sub-area, category, and audience tags
- View event details
- Click through to the official registration, ticketing, social media, WhatsApp, or organizer contact channel

**Organizers can:**
- Submit events through a form
- Provide event information, poster, contact details, and official links
- Indicate interest in future promotion support

**Admins can:**
- Add events manually
- Review submitted events
- Edit event details
- Publish, unpublish, and archive events
- Track basic event and organizer information

**Explicitly not in MVP:** ticketing, payment collection, user accounts, organizer login, organizer dashboards, QR tickets, refunds, formal WhatsApp opt-in, WhatsApp Business API integration.

The purpose of the MVP is to decide after 30 days whether Cholo Jai is worth continuing, pivoting, or stopping.

---

## 2. MVP Objective

The 30-day MVP should answer:

1. Can the team consistently source, curate, and publish events?
2. Do users click from Instagram to the website?
3. Do users open event detail pages?
4. Do users click outbound registration, ticketing, social, WhatsApp, or organizer contact links?
5. Do organizers respond to outreach?
6. Do organizers submit events themselves?
7. Does any event category, audience segment, or sub-area show stronger traction?
8. Is the workflow operationally manageable?
9. Is there enough evidence to continue for another validation cycle?

Revenue is not expected during the first 30 days.

---

## 3. Product Positioning

**Positioning statement:** Cholo Jai helps people discover events worth going to in Bangladesh, starting with Dhaka.

**Tagline:** *Cholo Jai: Find events worth going to*

**Product principle:** Cholo Jai should be curated, not exhaustive. The goal is not to list every event in Bangladesh — it's to surface events that are useful, interesting, relevant, and worth considering.

---

## 4. MVP Scope

### 4.1 Must Have
- Mobile-first Next.js website
- Homepage
- Event listing page
- Event detail page
- Submit event form
- Admin ability to add, edit, and publish events
- City filter
- Sub-area filter
- Date/weekend filter
- Category filter
- Support for multiple categories per event
- Outbound official event link
- Basic analytics
- Outbound click tracking

### 4.2 Should Have
- Audience tags
- Featured events
- Search
- Google Maps link
- Internal source link
- Organizer notes
- Email subscriber capture
- Event status management
- Basic archive for past events

### 4.3 Low Priority
- Share event button
- Add to calendar button
- Instagram save prompt
- "Send me weekend events" form
- Public WhatsApp channel/community link (only if simple, no formal business onboarding required)

### 4.4 Out of Scope
Ticket purchase, payment collection, refunds, organizer settlement, organizer login, organizer dashboard, user account creation, user login, saved events via accounts, formal WhatsApp opt-in, WhatsApp Business API, QR ticketing, seat selection, mobile app, ratings/reviews, chat, AI recommendations, complex CRM, paid promotion engine.

---

## 5. User Types

| Type | Description | Examples |
|---|---|---|
| **Event Attendee** | Wants to discover events/activities | Students, young professionals, families, workshop/seminar attendees, weekend planners, budget/free-event seekers |
| **Event Organizer** | Wants visibility for an event | University clubs, workshop hosts, training providers, cultural/community/seminar/exhibition/food/sports organizers |
| **Admin** | Internal user managing content | Event curator, reviewer, content manager, platform admin |

---

## 6. User Journeys

### 6.1 Journey 1 — Discover Event from Instagram
User sees an Instagram post/reel/story → clicks link → lands on site → views curated events → filters (date/city/sub-area/category/tag) → opens event detail → clicks outbound button (Register / Get Tickets / Learn More / Contact Organizer / View Official Page) → redirected externally → click is tracked.

### 6.2 Journey 2 — Browse Directly on Website
Visits site directly → sees featured/upcoming events → filters (city, sub-area, date/weekend, category, audience tag) → opens detail page → clicks outbound link → optionally subscribes by email.

### 6.3 Journey 3 — Organizer Submits Event
Visits "Submit Your Event" → fills event info → uploads poster → provides contact details → provides official link → selects city/sub-area/category/tags → indicates interest in future promotion → submission saved as `Submitted` → admin reviews → approve/edit/reject/request info → published event appears on site.

### 6.4 Journey 4 — Admin Adds Event Manually
Admin sources event from public channels → verifies legitimacy → creates entry → fills required fields → stores source link internally → assigns category/city/sub-area/tags → publishes → event goes live.

### 6.5 Journey 5 — Admin Reviews Submitted Event
Opens submitted list → reviews details (link, poster, organizer, location, date/time) → edits if needed → Publish / Keep as draft / Reject / Request more info → published events go live.

### 6.6 Journey 6 — User Uses Filters
Visits listing page → selects filters (city, sub-area, date/weekend, category, audience tag) → sees results → can clear/change filters → opens detail → clicks outbound link.

---

## 7. Functional Requirements

### 7.1 Public Website

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | View curated upcoming events | Must |
| FR-02 | View event detail pages | Must |
| FR-03 | Filter by city | Must |
| FR-04 | Filter by sub-area within city | Must |
| FR-05 | Filter by date/weekend | Must |
| FR-06 | Filter by category | Must |
| FR-07 | Filter by audience tag | Should |
| FR-08 | Search by name/location/sub-area/category/tag | Should |
| FR-09 | See whether event is free or paid | Must |
| FR-10 | Click official outbound event link | Must |
| FR-11 | Track outbound event link clicks | Must |
| FR-12 | See featured events | Should |
| FR-13 | Subscribe for email updates | Should |
| FR-14 | Share an event | Low |
| FR-15 | Add event to calendar | Low |

### 7.2 Homepage

| ID | Requirement | Priority |
|---|---|---|
| FR-16 | Shows Cholo Jai positioning clearly | Must |
| FR-17 | Shows upcoming/featured events | Must |
| FR-18 | Navigation to event listing page | Must |
| FR-19 | Link to submit event form | Must |
| FR-20 | Filter/category shortcuts | Should |
| FR-21 | Email subscription option | Should |

### 7.3 Event Listing Page

| ID | Requirement | Priority |
|---|---|---|
| FR-22 | Shows published upcoming events | Must |
| FR-23 | Card shows title, date, city, sub-area, category, image | Must |
| FR-24 | Card shows price/free label | Must |
| FR-25 | Open detail page from card | Must |
| FR-26 | Filter by city | Must |
| FR-27 | Filter by sub-area | Must |
| FR-28 | Filter by category | Must |
| FR-29 | Filter by date/weekend | Must |
| FR-30 | Filter by audience tag | Should |
| FR-31 | Empty state when no matches | Must |
| FR-32 | Past events excluded from default upcoming list | Must |

### 7.4 Event Detail Page

| ID | Requirement | Priority |
|---|---|---|
| FR-33 | Event name | Must |
| FR-34 | Poster/image | Must |
| FR-35 | Date and start time | Must |
| FR-36 | End time (if available) | Should |
| FR-37 | City, sub-area, venue | Must |
| FR-38 | Area/location details | Must |
| FR-39 | One or more categories | Must |
| FR-40 | Audience tags (if available) | Should |
| FR-41 | Price/free label | Must |
| FR-42 | Short description | Must |
| FR-43 | Organizer name | Must |
| FR-44 | Official outbound link | Must |
| FR-45 | Google Maps link (if available) | Should |
| FR-46 | Share button | Low |
| FR-47 | Add to calendar button | Low |

Outbound button labels: `Register`, `Get Tickets`, `Learn More`, `Contact Organizer`, `View Official Page` — selectable by admin per event.

### 7.5 Submit Event Form

| ID | Requirement | Priority |
|---|---|---|
| FR-48 | Submit event details via form | Must |
| FR-49 | Upload poster/image | Must |
| FR-50 | Organizer name | Must |
| FR-51 | Organizer phone | Must |
| FR-52 | Organizer email | Should |
| FR-53 | Organizer social link | Should |
| FR-54 | Event name | Must |
| FR-55 | Event description | Must |
| FR-56 | Event date and time | Must |
| FR-57 | Venue and location | Must |
| FR-58 | City and sub-area selection | Must |
| FR-59 | One or more categories | Must |
| FR-60 | Audience tags | Should |
| FR-61 | Free/paid indicator | Must |
| FR-62 | Official ticket/register/contact/social link | Must |
| FR-63 | Interest in future promotion support | Should |
| FR-64 | Submission saved for admin review | Must |
| FR-65 | Confirmation shown after submission | Should |

### 7.6 Admin

| ID | Requirement | Priority |
|---|---|---|
| FR-66 | Add event manually | Must |
| FR-67 | Edit event details | Must |
| FR-68 | Upload/change event image | Must |
| FR-69 | Assign city/sub-area | Must |
| FR-70 | Assign categories | Must |
| FR-71 | Assign audience tags | Should |
| FR-72 | Add official outbound link | Must |
| FR-73 | Choose outbound button label | Should |
| FR-74 | Add internal source link | Should |
| FR-75 | Add internal notes | Should |
| FR-76 | Publish event | Must |
| FR-77 | Unpublish event | Must |
| FR-78 | Archive past event | Should |
| FR-79 | Reject submitted event | Should |
| FR-80 | Mark event as featured | Should |
| FR-81 | View submitted events | Must |
| FR-82 | View published events | Must |
| FR-83 | Update event status | Must |

### 7.7 Analytics

| ID | Requirement | Priority |
|---|---|---|
| FR-84 | Track website visits | Must |
| FR-85 | Track traffic source | Must |
| FR-86 | Track Instagram-to-website visits | Must |
| FR-87 | Track event detail page views | Must |
| FR-88 | Track outbound link clicks | Must |
| FR-89 | Track most viewed events | Should |
| FR-90 | Track most clicked events | Should |
| FR-91 | Track most used categories | Should |
| FR-92 | Track most used sub-areas | Should |
| FR-93 | Track submit-event form completions | Must |
| FR-94 | Track email signups | Should |

---

## 8. Technical Architecture (Next.js + FastAPI)

### 8.1 High-Level Architecture

```
[Instagram] --> [Next.js frontend (Vercel or similar)]
                       |
                       |  REST calls (fetch/axios)
                       v
              [FastAPI backend (Uvicorn/Gunicorn)]
                       |
        +--------------+--------------+
        |                             |
 [PostgreSQL DB]              [Object storage for images]
        |                     (S3-compatible / Cloudinary)
        v
 [Analytics: Plausible/GA4/PostHog]
```

- **Frontend:** Next.js (App Router), server-rendered/ISR event listing & detail pages for SEO, mobile-first responsive UI.
- **Backend:** FastAPI serving a REST API for events, submissions, admin actions, and analytics event ingestion.
- **Database:** PostgreSQL as the primary database via SQLAlchemy/SQLModel + Alembic migrations, with SQLite as a local-development/resilience fallback (see §8.5).
- **Image storage:** S3-compatible bucket (e.g., Cloudflare R2 / AWS S3) or Cloudinary for poster uploads.
- **Auth (admin only):** Simple token/session-based auth (e.g., FastAPI + JWT) protecting `/admin` routes and admin API endpoints. No end-user auth in MVP.
- **Analytics:** Lightweight event tracking (Plausible, GA4, or PostHog) plus custom outbound-click tracking logged to the backend for internal metrics (FR-84–FR-94).

### 8.2 Repository Structure

```
cholo-jai/
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── events/
│   │   │   ├── page.tsx            # Event listing
│   │   │   └── [slug]/page.tsx     # Event detail
│   │   ├── submit/page.tsx         # Submit event form
│   │   └── admin/
│   │       ├── page.tsx            # Admin dashboard
│   │       ├── events/[id]/page.tsx
│   │       └── submissions/page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── api.ts                  # API client (calls FastAPI backend)
│   │   └── fallback-data.ts        # Static fallback events/categories/tags (see 8.6)
│   └── ...
├── backend/                 # FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── events.py
│   │   │   ├── submissions.py
│   │   │   ├── admin.py
│   │   │   └── analytics.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── core/
│   │   │   ├── config.py           # env-driven settings, incl. DB selection
│   │   │   ├── security.py
│   │   │   └── db.py               # PostgreSQL primary, SQLite fallback (see 8.5)
│   │   └── alembic/
│   └── requirements.txt / pyproject.toml
├── docker-compose.yml
└── README.md
```

### 8.3 Core Data Models

**Event**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title | string | required |
| slug | string | unique, for SEO URL |
| description | text | required |
| poster_url | string | required |
| start_date | date | required |
| start_time | time | required |
| end_date | date | optional |
| end_time | time | optional |
| city | string | required |
| sub_area | string | required |
| venue_name | string | required |
| area_details | text | required |
| maps_link | string | optional |
| categories | string[] | required, many-to-many |
| audience_tags | string[] | optional, many-to-many |
| price_type | enum(free, paid) | required |
| price_note | string | optional |
| organizer_name | string | required |
| organizer_phone | string | optional |
| organizer_email | string | optional |
| organizer_social_link | string | optional |
| outbound_link | string | required |
| outbound_button_label | enum | Register/Get Tickets/Learn More/Contact Organizer/View Official Page |
| source_link | string | internal only |
| admin_notes | text | internal only |
| is_featured | boolean | default false |
| is_recommended | boolean | default false |
| status | enum | draft, submitted, published, unpublished, archived, rejected |
| expected_attendance | integer | optional |
| created_at / updated_at | timestamp | |

**Submission** (organizer-submitted event, pre-review)
- Same fields as Event, plus:
  - `wants_promotion_support: boolean`
  - `additional_notes: text`
  - `reviewed_by: string` (admin id/name, nullable)
  - `review_status: enum(submitted, approved, rejected, needs_info)`

**Category** — `id, name, slug`
**AudienceTag** — `id, name, slug`
**SubArea** — `id, city, name`
**EmailSubscriber** — `id, email, created_at`
**AnalyticsEvent** — `id, event_type (page_view, outbound_click, form_submit), event_id (nullable FK), referrer, created_at`

### 8.4 FastAPI Endpoints (indicative)

**Public**
- `GET /events` — list published events; query params: `city, sub_area, category, audience_tag, date_from, date_to, weekend, search, featured`
- `GET /events/{slug}` — event detail
- `GET /categories`, `GET /audience-tags`, `GET /sub-areas`
- `POST /submissions` — organizer event submission
- `POST /subscribers` — email capture
- `POST /analytics/pageview`
- `POST /analytics/outbound-click`

**Admin (auth required)**
- `POST /admin/login`
- `GET /admin/events`, `POST /admin/events`, `PATCH /admin/events/{id}`, `DELETE /admin/events/{id}`
- `PATCH /admin/events/{id}/status` — publish/unpublish/archive
- `GET /admin/submissions`, `PATCH /admin/submissions/{id}` — approve/reject/request info
- `GET /admin/analytics/summary` — visits, clicks, top events/categories/sub-areas
- `POST /admin/uploads` — image upload proxy to object storage

### 8.5 Database Strategy — PostgreSQL Primary, SQLite Fallback

- **Primary:** PostgreSQL for all real deployments (staging/production). Chosen for reliability, concurrent writes (admin + submissions + analytics), and JSON/array support for categories/tags.
- **Fallback:** SQLite, used when:
  - Running locally without a Postgres instance available (fast onboarding for new contributors)
  - `DATABASE_URL` is unset or unreachable at startup, so local development/demoing never fully blocks on infra
- **Implementation approach:**
  - Use SQLAlchemy/SQLModel so the ORM layer is DB-agnostic; avoid Postgres-only column types (e.g., prefer JSON columns over native `ARRAY`/`JSONB` where feasible, or guard their use behind a dialect check) so the same models work on both engines.
  - `core/db.py` reads `DATABASE_URL` from environment. If it's missing or the connection fails at startup, log a clear warning and fall back to a local SQLite file (e.g., `./data/fallback.db`).
  - Alembic migrations should run against both dialects; test migrations on SQLite before assuming they're safe for Postgres-only features.
  - SQLite fallback is for **local development and resilience/demo purposes only** — not a recommended production database for concurrent admin + public traffic. Document this clearly so it isn't mistaken for a production choice.

### 8.6 Frontend Fallback Data

The Next.js frontend should not show a broken or empty page if the FastAPI backend is unreachable (e.g., during early development, backend downtime, or demoing without the API running).

- Maintain a small static dataset in `frontend/lib/fallback-data.ts`: a handful of realistic sample events, categories, audience tags, and sub-areas mirroring the real data shape in §8.3.
- The API client (`lib/api.ts`) should catch fetch failures (network error, timeout, non-2xx response) and transparently return the fallback dataset instead of throwing, so listing/detail/homepage pages still render.
- Optionally surface a subtle non-blocking indicator (e.g., a small banner) when fallback data is being shown, so it's clear during development/demos that live data isn't loaded — but this should never block or degrade the user-facing experience.
- Fallback data should be excluded from real analytics tracking (don't log fake pageviews/clicks against sample events).
- This fallback is a resilience/dev-experience feature, not a replacement for real backend integration — outbound links, filters, and submission forms should still be built to work against the live API as the primary path.

### 8.7 Frontend Pages (Next.js App Router)

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Homepage | ISR |
| `/events` | Event listing with filters | ISR / client-side filtering on top of server data |
| `/events/[slug]` | Event detail | ISR, SEO metadata per event |
| `/submit` | Submit event form | CSR |
| `/admin` | Admin login + dashboard | CSR, protected |
| `/admin/events` | Manage events | CSR, protected |
| `/admin/submissions` | Review submissions | CSR, protected |

---

## 9. Event Data Fields (Summary)

**Required:** title, description, poster, start date/time, city, sub-area, venue, area/location, categories, price/free text, organizer name, outbound link, status.

**Optional:** end date/time, Maps link, audience tags, organizer phone/email/social, expected attendance, featured flag, recommended flag, general tags, source link, admin notes, outbound button label.

**Status values:** Draft, Submitted, Published, Unpublished, Archived, Rejected.

---

## 10. Organizer Submission Data Fields

Organizer name, phone, email (optional), social link (optional), event name, description, date, start/end time, venue, area/location, city, sub-area, categories, audience tags (optional), price/free status, official link, poster, expected attendance (optional), promotion interest flag, additional notes.

---

## 11. Categories, Tags, and Locations

**Initial categories:** Workshops, Seminars, University events, Student events, Family events, Weekend events, Concerts, Exhibitions, Food events, Sports, Islamic/community, Free events.

**Suggested audience tags:** Family, Couples, Friends, Students, Professionals, Women-friendly, Kids-friendly, Solo-friendly, Budget-friendly, Free entry, Indoor, Outdoor. (Tags supplement, not replace, categories.)

**Recommended initial Dhaka sub-areas:** Gulshan, Banani, Dhanmondi, Uttara, Mirpur, Bashundhara, Mohammadpur, Tejgaon, Farmgate, Motijheel, Old Dhaka, Hatirjheel, Baily Road, Purbachal, Dhaka University area, Other.

---

## 12. Event Curation Guidelines

**Suitable for listing:** public, paid, free, registration-based events; university/youth events; workshops/seminars; cultural, family-friendly, community events; food/sports/lifestyle/exhibition events.

**Requires careful review:** unclear organizers; missing venue/date; suspicious payment instructions; poor/misleading info; unofficial or fake-looking events; exaggerated claims; safety or reputational concerns.

**Not to list:** illegal events; adult/explicit events; gambling-related; drug-related; politically sensitive (unless specifically approved); hate/violence/discrimination promotion; suspicious payment collection; fraudulent events; events conflicting with Cholo Jai's brand.

---

## 13. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Mobile-first | Site must work well on mobile (most traffic from Instagram) |
| Performance | Listing and detail pages load quickly (target <2.5s LCP on mobile) |
| SEO readiness | Public event pages indexable, with per-event metadata/OpenGraph tags |
| Admin security | Admin routes protected via authenticated sessions/JWT |
| Data quality | Submitted events require admin review before publishing |
| Maintainability | Non-technical users can add/update event content via admin UI |
| Scalability | Data model supports more cities/sub-areas later without migration pain |
| Analytics | Basic tracking live from launch |
| Reliability | Site remains stable during traffic spikes from Instagram |
| Usability | Users find event info within a few clicks |
| Privacy | Subscriber/organizer contact data stored responsibly, access-limited |
| Compliance simplicity | No payment, settlement, ticketing, or formal WhatsApp opt-in in MVP |

---

## 14. 30-Day Validation Targets

- Website launched
- Instagram page active
- 40–60 curated events listed
- 500–1,000 Instagram followers
- 500–1,000 website visits
- 50–100 outbound event link clicks
- 10 organizer conversations
- 3 organizer-submitted events
- 2–3 organizers interested in future promotion/featured placement
- At least one category showing stronger traction than others

---

## 15. Primary Metrics

| Metric | Why It Matters |
|---|---|
| Website visits from Instagram | Shows whether Instagram can drive traffic |
| Event detail page views | Shows whether users explore events |
| Outbound event link clicks | Shows whether users take action |
| Organizer replies | Shows whether organizers care |
| Organizer-submitted events | Shows early organizer pull |
| Repeat organizer engagement | Shows relationship potential |
| Category-level performance | Shows where to focus next |
| Sub-area-level performance | Shows where demand is concentrated |
| Operational effort | Shows whether the model is sustainable |

## 16. Secondary Metrics

| Metric | Why It's Secondary |
|---|---|
| Instagram followers | Can grow without business value |
| Reel views | Reach signal, can be vanity |
| Likes/comments | Weak feedback signal alone |
| Number of events listed | Achievable without real market pull |
| General website visits | Weak unless users open events or click links |

---

## 17. Organizer Interest Test

Track whether organizers: reply to outreach; correct/update event details; submit events themselves; ask to be featured; ask how Cholo Jai can help promote the event; agree to be contacted for a future promotion pilot; indicate willingness to consider paid promotion once reach exists. **No payment required in the first 30 days.**

---

## 18. 30-Day Decision Framework

### 18.1 Continue If
- Instagram is driving traffic to the website
- Users open event detail pages
- Users click outbound event links
- Organizers reply or submit events
- At least one category shows stronger traction
- Workflow is operationally manageable
- There's a believable path to future promotion, ticketing, or organizer tools

### 18.2 Pivot If
- Instagram grows but the website doesn't convert
- Users browse but don't click outbound links
- Organizers don't submit events, but user interest is visible
- One category strongly outperforms the rest
- Platform works better as a niche page than a broad discovery platform

**Possible pivots:** Dhaka weekend-only discovery; student/university event discovery; workshop and seminar discovery; family-friendly event discovery; Instagram-first curated media page; organizer promotion service instead of a product platform.

### 18.3 Stop If
- Website traffic remains weak
- Users don't open event pages or click outbound links
- Organizers don't respond
- Event sourcing is too manual/heavy
- No category shows clear traction
- The idea feels like a generic Instagram page with no defensible path forward

---

## 19. Future Monetization Timing

No revenue expected in the 30-day MVP. A monetization test should only be considered after 30 days, if there's enough audience reach and organizer interest.

**Potential future monetization tests:** featured event placement, paid Instagram story/post inclusion, weekend roundup sponsorship, organizer promotion package, ticketing pilot, event management tools.

The first monetization test should validate willingness to pay — it doesn't need to maximize revenue.

---

## 20. Open Questions for Build

- What domain and social handles will be used?
- What is the minimum quality standard for event posters/images?
- Should Cholo Jai manually list public events without organizer approval?
- Should events be labelled "Official listing" vs. "Curated by Cholo Jai"?
- How should expired events be handled?
- Should sold-out events remain visible?
- What analytics tools will be used (Plausible / GA4 / PostHog)?
- What are the final initial categories?
- What are the final initial audience tags?
- What are the final Dhaka sub-areas?
- What is the process if an organizer asks to remove or correct an event?
- What is the process for handling user complaints about incorrect information?
- Will email subscriber capture be included in the first release or added later?
- Will a public WhatsApp channel/community link be used, or excluded completely in MVP?

---

## 21. Suggested 30-Day Build Timeline

| Days | Focus |
|---|---|
| 1–3 | Finalize open questions, data model, DB schema, repo setup, category/tag/sub-area lists |
| 4–10 | Build FastAPI core (events, categories, submissions, admin auth) + DB migrations |
| 6–14 | Build Next.js homepage, listing page, detail page (parallel with backend) |
| 12–16 | Build submit event form + admin dashboard (CRUD, review workflow) |
| 15–18 | Analytics integration (pageviews, outbound clicks, source tracking) |
| 17–20 | Seed 15–20 initial curated events manually, start Instagram content |
| 20–30 | Launch, daily curation + organizer outreach, monitor metrics, iterate on filters/UX bugs |
