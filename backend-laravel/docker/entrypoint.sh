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

SAFE_MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
case "$SAFE_MYSQL_PASSWORD" in
    *"in .env or Coolify secrets"*)
        echo "[entrypoint] MYSQL_PASSWORD contains placeholder text; ignoring invalid value."
        SAFE_MYSQL_PASSWORD=""
        ;;
esac

SAFE_ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
case "$SAFE_ADMIN_PASSWORD" in
    *"in .env or Coolify secrets"*)
        echo "[entrypoint] ADMIN_PASSWORD contains placeholder text; ignoring invalid value."
        SAFE_ADMIN_PASSWORD=""
        ;;
esac

# Normalize DB connection variables used by bootstrap + migrate.
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-${MYSQL_DATABASE:-cholo_jai}}"
DB_USERNAME="${DB_USERNAME:-${MYSQL_USER:-cholo}}"
DB_PASSWORD="${DB_PASSWORD:-$SAFE_MYSQL_PASSWORD}"

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
        echo "DB_PASSWORD=${SAFE_MYSQL_PASSWORD}"
        echo "FILESYSTEM_DISK=public"
        echo "CACHE_STORE=file"
        echo "SESSION_DRIVER=file"
        echo "QUEUE_CONNECTION=sync"
        echo "ADMIN_EMAIL=${ADMIN_EMAIL:-admin@cholojai.bd}"
        echo "ADMIN_PASSWORD=${SAFE_ADMIN_PASSWORD}"
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

# 3. Wait for MySQL (root ping is most reliable during bootstrap).
echo "[entrypoint] Waiting for MySQL at ${DB_HOST}:${DB_PORT}…"
ATTEMPTS=0
MAX_ATTEMPTS=30
until mysqladmin ping --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u root "-p${MYSQL_ROOT_PASSWORD}" --silent >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
        echo "[entrypoint] MySQL never came up — exiting."
        exit 1
    fi
    sleep 2
done
echo "[entrypoint] MySQL is up."

# 3.5 Ensure application DB + user exist on first boot (idempotent).
echo "[entrypoint] Ensuring database/user grants…"
mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u root "-p${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USERNAME'@'%' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER '$DB_USERNAME'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_DATABASE\`.* TO '$DB_USERNAME'@'%';
FLUSH PRIVILEGES;
SQL

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