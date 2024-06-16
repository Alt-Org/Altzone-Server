# Use Node.js base image
FROM node:18-bullseye-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY ./swagger.json ./swagger.json
COPY ./server.js ./server.js

# Expose the application port
EXPOSE 8081

# Start the application
CMD ["node", "server.js"]