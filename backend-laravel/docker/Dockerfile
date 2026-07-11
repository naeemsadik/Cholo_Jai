# Cholo Jai — Laravel backend image
#
# Use the official php:8.3-fpm-bookworm image. The bookworm variant
# ships every common extension (pdo_mysql, mysqli, intl, gd, bcmath,
# mbstring, opcache, zip) pre-compiled, so this builds in seconds
# rather than the 15+ minutes a from-source Alpine build takes.
# (The php:8.3-fpm-alpine image builds almost every extension from
# source via docker-php-ext-install which is too slow for CI.)

FROM php:8.3-fpm-bookworm

WORKDIR /var/www/html

# System tools we need at runtime. PHP extensions are already in the
# base image — no compilation here.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy ONLY composer manifests first so Docker can cache this layer.
COPY composer.json composer.lock ./

# Install vendor (with autoloader + scripts — vendor/ is .gitignored,
# so this MUST run in the image).
RUN composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --optimize-autoloader

# Now copy the rest of the source.
COPY . .

# Writable storage dirs + entrypoint perms.
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

# Entrypoint waits for MySQL, runs migrations, then hands off to php-fpm.
CMD ["docker/entrypoint.sh"]