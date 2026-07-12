#!/bin/sh
set -e

cd /var/www/html

# Cached Laravel configuration is release-specific and must not survive deploys.
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction
php artisan storage:link || true

# Volumes are mounted after the image is built, so repair their ownership here.
chown -R www-data:www-data storage bootstrap/cache

exec php-fpm
