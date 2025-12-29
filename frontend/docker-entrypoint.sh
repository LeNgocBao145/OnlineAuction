#!/bin/sh

# Thay thế các biến VITE_* trong index.html từ env runtime
for var in $(env | grep ^VITE_ | cut -d= -f1); do
  value=$(printenv $var)
  sed -i "s|%$var%|$value|g" /usr/share/nginx/html/index.html
done

exec "$@"