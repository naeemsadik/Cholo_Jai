# Cholo Jai — Laravel backend image
#
# Use mlocati/php-docker-image: a Debian-based PHP image with every
# common extension (pdo_mysql, intl, gd, bcmath, mbstring, opcache,
# zip) already installed. We add only what Laravel needs: composer
# (built in) + the project source.

FROM mlocati/php-docker-image:8.3-fpm-bookworm

WORKDIR /var/www/html

# Install system tools we need at runtime. No PHP extension compilation.
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