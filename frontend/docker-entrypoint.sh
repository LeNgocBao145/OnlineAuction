#!/bin/sh

# Thay thế các biến VITE_* trong index.html từ env runtime
for var in $(env | grep ^VITE_ | cut -d= -f1); do
  sed -i "s|%$var%|${!var}|g" /usr/share/nginx/html/index.html
done

exec "$@"