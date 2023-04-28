#remember to change HOST env variable to 0.0.0.0 in .env file
FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY --chown=node:node . .
EXPOSE 8080

CMD ["node", "./dist/index.js"]