# PHP 8.3 FPM image for Cholo Jai — Laravel 11 + Scramble.
# Builds for both local `docker compose` and Coolify deploys.

FROM php:8.3-fpm-alpine

# System deps for PHP extensions + image processing.
RUN apk add --no-cache \
        bash curl git unzip icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
        oniguruma-dev autoconf g++ make linux-headers \
        mysql-client

# PHP extensions Laravel needs.
RUN docker-php-ext-install pdo pdo_mysql mysqli mbstring zip bcmath intl gd opcache

# Install Composer.
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1. Copy ONLY composer manifests first so Docker can cache this layer.
#    `vendor/` is .gitignored so it's NOT in the build context — we
#    need composer to fetch deps every time, which is fine because the
#    upstream composer.lock pins exact versions for reproducible builds.
COPY composer.json composer.lock ./

# 2. Install vendor with full autoloader + scripts (so Laravel's package
#    discovery and post-autoload hooks register correctly). No
#    `--no-scripts --no-autoloader` here — we need them for the runtime.
#    `--no-dev` skips dev-only deps (phpunit, faker) for a smaller image.
RUN composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --optimize-autoloader

# 3. Copy the rest of the app source.
COPY . .

# 4. Make sure storage dirs exist with the right ownership. (Migrations
#    and uploads land here at runtime.)
RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/testing \
        storage/logs \
        bootstrap/cache \
        public/build \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

EXPOSE 9000

# Entrypoint waits for MySQL, runs migrations, then hands off to php-fpm.
CMD ["docker/entrypoint.sh"]