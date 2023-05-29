FROM nginx:1.23.4-bullseye

COPY prod_nginx.conf /etc/nginx/nginx.conf