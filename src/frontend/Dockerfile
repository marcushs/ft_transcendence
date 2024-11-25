# Use a basic web server to serve static files
FROM nginx:alpine

RUN apk update && apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -new -newkey rsa:2048 -keyout /etc/nginx/ssl/hleung_42_fr.key -out /etc/nginx/ssl/hleung_42_fr.crt -subj "/C=FR/ST=Auvergne-Rhône-Alpes/L=Lyon/O=42/OU=42/CN=hleung.42.fr"

# Copy static files
COPY ./static /var/www/static

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 443
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
