# Cholo Jai — Laravel Backend

Laravel 11 + PHP 8.3 + MySQL 8 backend for the Cholo Jai event-discovery platform.

## Quick links (after deploy)

| URL | Purpose |
|---|---|
| `http://localhost:8000/up` | Liveness probe (returns "Application up") |
| `http://localhost:8000/events` | Public event listing |
| `http://localhost:8000/docs/api` | **Scramble / Swagger UI** — browse and try every endpoint |
| `http://localhost:8000/docs/api.json` | OpenAPI 3.1 spec |
| `http://localhost:8080` | phpMyAdmin (MySQL GUI) — bound to localhost only |

## Wiring

- **Frontend** (`../frontend_rebuild/`) → points `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- **Public endpoints** live at the root (no `/api` prefix): `/events`, `/lookups`, `/submissions`, `/subscribers`, `/analytics/pageview`, etc. — this matches the frontend's wire contract verbatim.
- **Admin endpoints** live at `/admin/*`, plus a small set at `/api/*` for settings/CMS as expected by the admin UI.
- **Auth**: Laravel Sanctum personal-access tokens (`Authorization: Bearer <token>`).
- All admin routes are protected by `auth:sanctum` + `ensure.admin`.

## Deploy on a Coolify VPS

1. Copy the contents of this `backend-laravel/` folder to your VPS (or
   point Coolify's git-source at this directory).
2. Create a `.env` file next to `docker-compose.yml` on the VPS — copy
   `.env.coolify.example` and fill in the secrets.
3. In Coolify, add a new **Docker Compose** resource pointing at this
   directory. Coolify will read `docker-compose.yml`, set the env vars
   you paste in, build the images, and bring up the stack.
4. Once `cholo-jai-backend` reports healthy:
   - Public API: `https://<your-domain>/...`
   - Swagger UI: `https://<your-domain>/docs/api`
   - phpMyAdmin: expose through Coolify's port mapping on 8080 if you
     want browser access; otherwise tunnel in via SSH.

The container's `docker/entrypoint.sh` waits for MySQL to be ready,
generates `APP_KEY` if missing, runs migrations, and (optionally) seeds
the database when `SEED_DEMO_EVENTS=true`.

## Local development (Docker)

```bash
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan storage:link
```

The dev stack runs on `http://localhost:8000` (Laravel behind nginx), with phpMyAdmin at `http://localhost:8080`.

## Local development (no Docker)

```bash
composer install
cp .env.example .env   # then edit DB_HOST=127.0.0.1, DB_CONNECTION=mysql
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php -S localhost:8000 -t public
```

For zero-config quick-tests, keep `DB_CONNECTION=sqlite` (the default in the committed `.env`) — the codebase is portable across both engines.

## Default admin credentials

| Field | Value |
|---|---|
| email | `admin@cholojai.test` (override via `ADMIN_EMAIL`) |
| password | `password` (override via `ADMIN_PASSWORD`) |

## Key endpoints (full list: `php artisan route:list`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/events` | — | Public listing (status=published, filtered) |
| GET | `/events/hero` | — | Hero carousel |
| GET | `/events/{slug}` | — | Detail |
| GET | `/lookups` | — | categories, audience_tags, sub_areas, cities |
| POST | `/submissions` | — | Public submission intake |
| POST | `/subscribers` | — | Email signup |
| POST | `/analytics/pageview` | — | Fire-and-forget |
| POST | `/analytics/outbound-click` | — | Fire-and-forget |
| POST | `/analytics/event` | — | Form completion |
| POST | `/admin/login` | — | Sanctum token |
| GET/POST/PATCH/DELETE | `/admin/events[/{id}]` | bearer | Admin CRUD |
| PATCH | `/admin/events/{id}/status` | bearer | Status workflow |
| GET/PATCH | `/admin/submissions[/{id}]` | bearer | Submission queue |
| PATCH | `/admin/submissions/{id}/review` | bearer | Approve → promotes to Event |
| GET | `/admin/analytics/summary` | bearer | Aggregations |
| POST | `/admin/uploads` | bearer | Image upload |
| GET/PUT | `/api/settings` | bearer | Site settings singleton |
| GET/PUT | `/api/cms/home` | bearer | Homepage layout |
| GET/PUT | `/api/cms/pages[/{id}]` | bearer | CMS pages |

## Verification

Two PHP smoke scripts in `scripts/` exercise the full contract end-to-end:

```bash
php scripts/smoke-public.php
php scripts/smoke-write.php
```

The first verifies public reads + filters + lookup endpoints (and that `organizer.phone`, `admin_notes`, `source_link` are hidden from public responses). The second verifies submissions, analytics, admin auth + CRUD, image upload, analytics summary, and submission promotion.

## Architecture notes

- **Public-only-published** is enforced on every public read via `Event::published()` scope (`status='published'`). Admin routes bypass it.
- **`sub_area`** is a string in API payloads but stored as FK in DB. Controllers resolve via `city.name` + `sub_areas.name` case-insensitive lookup, never auto-creating user-submitted sub-areas (per PUKU.local.md).
- **Bangla (`*_bn`) fields** are stored in dedicated columns with `utf8mb4_unicode_ci` collation; displayed by the frontend with fallback to the English version.
- **Analytics** are 204-only, fire-and-forget, rate-limited at 600/min/IP. `X-Ghurighuri-Session` header is honoured for uniqueness counts.
- **Submission promotion** uses `DB::transaction` + `lockForUpdate` for safe concurrent review.
- **Security:** Sanctum bearer only (no SPA cookies), `EnsureAdmin` middleware as second gate, rate limits on analytics/login/submission, admin-internal fields hidden on public responses.

## Out of scope (per PRD)

We **do not** implement: ticketing, payments, organizer login, user accounts, WhatsApp Business API, QR tickets, ratings, chat, AI recommendations, scraping, or payment engines. See `../prd.md` §4.4.
