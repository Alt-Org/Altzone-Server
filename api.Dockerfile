FROM node:18-bullseye-slim

#tini for better kernel signal handling
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*
#set entrypoint to always run commands with tini
ENTRYPOINT ["/usr/bin/tini", "--"]

RUN mkdir /app && chown -R node:node /app

USER node

WORKDIR /app

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json
RUN npm install
#for production RUN npm ci --only-production && npm cache clean --force