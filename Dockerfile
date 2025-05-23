FROM node:23-bookworm-slim AS compile

RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && rm -rf dist/util/dataMock

FROM node:23-bookworm-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json
RUN npm ci --only-production && npm cache clean --force

COPY --from=compile /app/dist ./dist
COPY --from=compile /app/public ./public
COPY --from=compile /app/swagger.json ./swagger.json

FROM debian:12-slim AS start

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --from=build /usr/bin/tini /usr/bin/tini
COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build --chown=node:node /app /app

ENTRYPOINT ["/usr/bin/tini", "--"]

USER node
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080
CMD ["node", "dist/main.js"]