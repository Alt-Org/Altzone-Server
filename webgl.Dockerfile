FROM debian:bullseye-slim as nginx_build

RUN apt-get update \
    && apt-get install -y --no-install-recommends wget build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev

RUN wget --no-check-certificate https://nginx.org/download/nginx-1.24.0.tar.gz \
    && tar -zxvf nginx-1.24.0.tar.gz
WORKDIR nginx-1.24.0

#Add all needed modules and build
RUN ./configure --sbin-path=/usr/bin/nginx --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --with-pcre --pid-path=/var/run/nginx.pid --with-http_ssl_module --modules-path=/etc/nginx/modules --with-http_v2_module
RUN make \
    && make install

COPY webgl_nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]


FROM debian:bullseye-slim as start
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv libaugeas0

#Copy nginx build
COPY --from=nginx_build /nginx-1.24.0 /nginx-1.24.0
COPY --from=nginx_build /etc/nginx /etc/nginx
COPY --from=nginx_build /usr/bin/nginx /usr/bin/nginx
COPY --from=nginx_build /var/log/nginx /var/log/nginx
COPY --from=nginx_build /var/run /var/run
COPY --from=nginx_build /usr/local/nginx /usr/local/nginx

#Start the server in non daemon mode (otherwise Docker will close the container)
EXPOSE 80
EXPOSE 443
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]


