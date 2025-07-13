FROM mongo:8.0.12-rc0-noble

WORKDIR /etc/mongo

RUN openssl rand -base64 756 > keyfile && \
  chmod 400 keyfile && \
  chown mongodb:mongodb ./keyfile

COPY ./mongod.conf ./mongod.conf

CMD ["mongod", "--config", "/etc/mongo/mongod.conf"]