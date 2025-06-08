FROM node:lts-alpine AS compile

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build \
    && rm -rf dist/util/dataMock \
    && rm -rf dist/__tests__ dist/**/*.test.js

FROM node:lts-alpine AS build

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=compile /app/dist ./dist
COPY --from=compile /app/public ./public
COPY --from=compile /app/swagger.json ./swagger.json

FROM node:lts-alpine AS start

COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build --chown=node:node /app /app

RUN apk add --no-cache tini

USER node
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
