# Use a basic web server to serve static files
FROM nginx:alpine

# Copy static files
COPY ./static /var/www/static

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
