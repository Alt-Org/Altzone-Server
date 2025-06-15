FROM node:lts-alpine AS build
LABEL maintainer="Mikhail Deriabin"

WORKDIR /app

COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm ci
RUN npm run build

FROM node:lts-alpine AS prepare

#RUN mkdir /app && chown -R node:node /app
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    rm package.json package-lock.json

COPY --from=build /app/dist ./dist

FROM node:lts-alpine AS start

COPY --from=prepare --chown=node:node /usr/local/bin/node /usr/local/bin/node
COPY --from=prepare --chown=node:node /app /app

RUN apk add --no-cache tini

USER node
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]