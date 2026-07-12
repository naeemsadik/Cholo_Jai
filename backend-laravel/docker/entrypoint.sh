#!/bin/sh
# First-boot setup for the Laravel container.
#
# Runs once at container start (PHP-FPM is the long-running process).
# Steps:
#   1. Synthesise a .env file from compose-injected env vars if missing.
#   2. Generate APP_KEY if none.
#   3. Wait for MySQL to accept connections.
#   4. Run migrations.
#   5. Link storage.
#   6. Optionally seed (RUN_SEED=true).
#   7. Hand off to php-fpm.

set -e

cd /var/www/html

# Guard against accidental instructional text in APP_KEY (e.g. "generate with ...")
# which breaks dotenv parsing because of embedded whitespace.
SAFE_APP_KEY="${APP_KEY:-}"
case "$SAFE_APP_KEY" in
    *[[:space:]]*)
        echo "[entrypoint] APP_KEY contains whitespace; ignoring invalid value."
        SAFE_APP_KEY=""
        ;;
esac

# 1. Bootstrap .env from compose-injected env vars.
if [ ! -f .env ]; then
    echo "[entrypoint] No .env present — synthesising one from the environment."
    {
        echo "APP_NAME=${APP_NAME:-CholoJai}"
        echo "APP_ENV=${APP_ENV:-production}"
        echo "APP_KEY=${SAFE_APP_KEY}"
        echo "APP_DEBUG=${APP_DEBUG:-false}"
        echo "APP_URL=${APP_URL:-http://localhost:8000}"
        echo "DB_CONNECTION=mysql"
        echo "DB_HOST=db"
        echo "DB_PORT=3306"
        echo "DB_DATABASE=${MYSQL_DATABASE:-cholo_jai}"
        echo "DB_USERNAME=${MYSQL_USER:-cholo}"
        echo "DB_PASSWORD=${MYSQL_PASSWORD:-}"
        echo "FILESYSTEM_DISK=public"
        echo "CACHE_STORE=file"
        echo "SESSION_DRIVER=file"
        echo "QUEUE_CONNECTION=sync"
        echo "ADMIN_EMAIL=${ADMIN_EMAIL:-admin@cholojai.bd}"
        echo "ADMIN_PASSWORD=${ADMIN_PASSWORD:-}"
        echo "FRONTEND_ORIGIN=${FRONTEND_ORIGIN:-http://localhost:3000}"
        echo "API_VERSION=${API_VERSION:-0.1.0}"
    } > .env
fi

# 2. Generate APP_KEY if missing.
if ! grep -q '^APP_KEY=base64' .env 2>/dev/null; then
    if [ -z "$SAFE_APP_KEY" ]; then
        echo "[entrypoint] APP_KEY missing — generating one."
        GEN=$(php artisan key:generate --force --show 2>/dev/null | tail -1 | sed 's/^APP_KEY=//')
        case "$GEN" in
            \"*\") GEN=$(echo "$GEN" | sed 's/^"//;s/"$//') ;;
        esac
        if [ -n "$GEN" ]; then
            sed -i.bak "s|^APP_KEY=.*|APP_KEY=$GEN|" .env
            rm -f .env.bak
            export APP_KEY="$GEN"
            echo "[entrypoint] APP_KEY generated and saved."
        fi
    fi
fi

# 3. Wait for MySQL.
echo "[entrypoint] Waiting for MySQL at ${DB_HOST}:${DB_PORT}…"
ATTEMPTS=0
MAX_ATTEMPTS=30
DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_DATABASE="$DB_DATABASE" DB_USERNAME="$DB_USERNAME" DB_PASSWORD="$DB_PASSWORD" \
php -r '
    $h = getenv("DB_HOST"); $P = getenv("DB_PORT");
    $n = getenv("DB_DATABASE"); $u = getenv("DB_USERNAME"); $w = getenv("DB_PASSWORD");
    try { new PDO("mysql:host=$h;port=$P;dbname=$n", $u, $w); exit(0); }
    catch (Throwable $e) { exit(1); }
' && break_on_ok=1
until [ "${break_on_ok:-0}" = "1" ]; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
        echo "[entrypoint] MySQL never came up — exiting."
        exit 1
    fi
    sleep 2
    DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" DB_DATABASE="$DB_DATABASE" DB_USERNAME="$DB_USERNAME" DB_PASSWORD="$DB_PASSWORD" \
    php -r '
        $h = getenv("DB_HOST"); $P = getenv("DB_PORT");
        $n = getenv("DB_DATABASE"); $u = getenv("DB_USERNAME"); $w = getenv("DB_PASSWORD");
        try { new PDO("mysql:host=$h;port=$P;dbname=$n", $u, $w); exit(0); }
        catch (Throwable $e) { exit(1); }
    ' && break_on_ok=1 || break_on_ok=0
done
echo "[entrypoint] MySQL is up."

# 4. Migrate.
echo "[entrypoint] Running migrations…"
php artisan migrate --force --no-interaction

# 5. Link storage.
echo "[entrypoint] Linking storage…"
php artisan storage:link || true

# 6. Seed (opt-in).
if [ "${RUN_SEED:-false}" = "true" ]; then
    echo "[entrypoint] Seeding database (RUN_SEED=true)…"
    php artisan db:seed --force --no-interaction || true
fi

# 7. Clear cached config/routes so updates from a new image take effect.
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

echo "[entrypoint] Launching php-fpm."
exec php-fpm