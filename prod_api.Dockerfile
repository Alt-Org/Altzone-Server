FROM node:18-bullseye-slim as build

#tini for better kernel signal handling
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json
RUN npm ci --only-production && npm cache clean --force

COPY ./dist ./dist
COPY ./public ./public
COPY ./swagger.json ./swagger.json

#for production RUN npm ci --only-production && npm cache clean --force

FROM debian:11.7-slim as start
RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node
ENV NODE_VERSION 18.16.0

COPY --from=build /usr/bin/tini /usr/bin/tini
COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build --chown=api:api /app /app
ENTRYPOINT ["/usr/bin/tini", "--"]

USER node
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080
CMD ["node", "dist/main.js"]