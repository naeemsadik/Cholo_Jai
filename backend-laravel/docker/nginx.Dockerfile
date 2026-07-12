FROM nginx:alpine

# Bake nginx vhost config into the image to avoid host bind-mount
# mismatches in managed platforms (e.g. Coolify).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Provide Laravel public assets + front controller for try_files/index.php.
COPY public /var/www/html/public
