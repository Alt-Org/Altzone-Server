#This Dockerfile shuold be used with appropriate docker-compose file, which:
#1. has ports 80 and 443 open
#2. U may also wanna add a volume for static files serving, for ex.: ./public:/usr/local/nginx/public

#Remember to generate a SSL certificate (if HTTPS is needed) inside nginx container, after start stage is completed:
#1. docker container exec -it {container_id} bash (Go to the container)
#2. certbot_config (Run added on the start stage bash script, which should be placed in the same folder with this Dockerfile)

#After that u can setup a cronjob for auto renew:
#1. docker container exec -it {container_id} bash (Go to the container)
#2. certbot_renew (Run added on the start stage bash script, which should be placed in the same folder with this Dockerfile)

#Also it is a good idea to update the certbot monthly:
#1. docker container exec -it {container_id} bash (Go to the container)
#2. /opt/certbot/bin/pip install --upgrade certbot certbot-nginx (Update certbot with pip)

#Build custom nginx
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

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]


#Install certbot for HTTPS and start the nginx
FROM debian:bullseye-slim as start
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv libaugeas0

#Install certpot with pip
RUN python3 -m venv /opt/certbot/ \
    && /opt/certbot/bin/pip install --upgrade pip \
    && /opt/certbot/bin/pip install certbot certbot-nginx

#Remove unused files after apt-get installations
RUN rm -rf /var/lib/apt/lists/*

#Add certbot_config script to container bash, which should be placed in the same folder with that Dockerfile
COPY ./certbot_config /usr/bin/certbot_config
RUN sed -i -e 's/\r$//' /usr/bin/certbot_config \
    && chmod +rwx /usr/bin/certbot_config

#Add certbot_certonly script to container bash, which should be placed in the same folder with that Dockerfile
COPY ./certbot_certonly /usr/bin/certbot_certonly
RUN sed -i -e 's/\r$//' /usr/bin/certbot_certonly \
    && chmod +rwx /usr/bin/certbot_certonly

#Add certbot_renew script to container bash, which should be placed in the same folder with that Dockerfile
COPY ./certbot_renew /usr/bin/certbot_renew
RUN sed -i -e 's/\r$//' /usr/bin/certbot_renew \
    && chmod +rwx /usr/bin/certbot_renew

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
