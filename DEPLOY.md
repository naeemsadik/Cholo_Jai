# Cholo Jai — VPS / Coolify deployment

The Laravel backend lives in `backend-laravel/`. The deployment manifests
in this directory (the root of the repo) build that subdirectory.

## Files

- **`docker-compose.yaml`** — Production compose for Coolify / VPS.
  Builds the `backend` image from `backend-laravel/`. Brings up MySQL,
  php-fpm, nginx, and phpMyAdmin.
- **`.env.coolify.example`** — Template for the env vars you need to set
  before `docker compose up -d`. Copy this to `.env` next to the
  compose file and fill in the secrets.

> **Why `docker-compose.yaml` (not `.yml`)?** Coolify looks for that
> exact filename. Compose itself accepts both, but Coolify's "Docker
> Compose" deploy type does not.

## Deploy

```bash
cp .env.coolify.example .env
# edit .env — set MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, ADMIN_PASSWORD, etc.
docker compose up -d
curl http://localhost:8000/up                  # 200 OK
open http://localhost:8000/docs/api           # Scramble Swagger UI
```

Or in Coolify: **Add Resource → Docker Compose** → point at this
directory (`/`) → set the env vars in the UI → deploy. Coolify will
build the image, run the entrypoint (which migrates + seeds), and
expose port 8000.

## URLs after deploy

| URL | Purpose |
|---|---|
| `http://<host>:8000/up` | Liveness probe |
| `http://<host>:8000/events` | Public event listing |
| `http://<host>:8000/docs/api` | **Scramble Swagger UI** |
| `http://<host>:8000/docs/api.json` | OpenAPI 3.1 spec |
| `http://127.0.0.1:8080` | phpMyAdmin (localhost only; SSH-tunnel for remote) |

## Architecture

```
backend-laravel/         ← the app source
├── app/                 ← Laravel code
├── docker/             ← Dockerfile + nginx.conf + entrypoint.sh
└── ...
docker-compose.yaml      ← THIS file: builds backend-laravel/, runs everything
.env.coolify.example     ← env vars template
```

The `build.context` is `./backend-laravel`, so the Docker daemon compiles
the image from inside that subdirectory but is invoked from the repo
root by Coolify / `docker compose`.