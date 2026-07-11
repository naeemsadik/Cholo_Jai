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

# Pre-warm vendor cache so first boot doesn't re-download.
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist || true

COPY . .

RUN composer dump-autoload --optimize \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

EXPOSE 9000

# Entrypoint waits for MySQL, runs migrations, then hands off to php-fpm.
CMD ["docker/entrypoint.sh"]