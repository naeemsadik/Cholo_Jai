# PHP-FPM base image tuned for Laravel 11
FROM php:8.3-fpm-alpine

# System deps
RUN apk add --no-cache \
    git curl unzip icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev autoconf g++ make linux-headers

# PHP extensions Laravel needs
RUN docker-php-ext-install pdo pdo_mysql mbstring zip bcmath intl gd opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
