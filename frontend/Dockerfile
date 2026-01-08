# Build stage
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_OTP_EXPIRE_TIME
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_TINYMCE_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_OTP_EXPIRE_TIME=$VITE_OTP_EXPIRE_TIME
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY
ENV VITE_TINYMCE_API_KEY=$VITE_TINYMCE_API_KEY

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
