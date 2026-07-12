#!/bin/sh
set -e

cd /var/www/html

php artisan migrate --force --no-interaction
php artisan storage:link || true

exec php-fpm
