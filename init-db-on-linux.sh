#!/bin/bash

# Run with "bash ./init-db-on-linux.sh"

set -e

TEMP_CONTAINER_NAME="mongo-init-temp"
CONTAINER_NAME="altzone_db_dev"
SERVICE_NAME="db_dev"
VOLUME_NAME="altzone_db_dev"
MONGO_PORT=27017
USERNAME="rootUser"
PASSWORD="superSecretPassword"
DATABASE="altzone_dev"
REPLICA_NAME="rs0"
REPLICA_HOST="localhost"


# Step 1: Start temp container
echo "1. Starting temporary Mongo container to set volume metadata up..."
docker run -d \
  --name $TEMP_CONTAINER_NAME \
  -e MONGO_INITDB_ROOT_USERNAME=$USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$PASSWORD \
  -e MONGO_INITDB_DATABASE=$DATABASE \
  -v $VOLUME_NAME:/data/db \
  -p $MONGO_PORT:27017 \
  mongo:8

# Step 2: Wait for Mongo to be ready
echo "2. Waiting for MongoDB to start..."
until docker exec $TEMP_CONTAINER_NAME mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done

echo "MongoDB volume is up. Removing the temporary container"

docker stop $TEMP_CONTAINER_NAME
docker rm $TEMP_CONTAINER_NAME

echo "3. Initiating replica set"

echo "Starting MongoDB container with docker compose"
docker compose up -d $SERVICE_NAME

echo "Waiting for MongoDB to be ready..."
until docker exec $CONTAINER_NAME mongosh --quiet -u $USERNAME -p $PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done

echo "Initiating replica set for the container..."
docker exec $CONTAINER_NAME mongosh --quiet -u $USERNAME -p $PASSWORD --authenticationDatabase admin --eval \
  "rs.initiate({ _id: '${REPLICA_NAME}', members: [{ _id: 0, host: '${REPLICA_HOST}:27017' }] })"

echo "Replica set initiated."

# Step 4: Stop and remove the container
echo "4. Stopping and removing the container"
docker compose down

echo "MongoDB container shut down. Volume is now ready for docker-compose up."