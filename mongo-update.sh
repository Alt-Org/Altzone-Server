#!/bin/bash

set -e

# CONFIG
CONTAINER_NAME="altzone_db_dev"
VOLUME_NAME="altzone-server_altzone_db_dev"
COMPOSE_FILE="docker-compose.yml"
DUMP_FILE="./dump.archive"
MONGO_SERVICE_NAME="db_dev"
MONGO_USERNAME="rootUser"
MONGO_PASSWORD="superSecretPassword"
AUTH_DB="admin"

echo "🔹 Step 0: Start docker compose and wait 10s..."
docker compose -f "$COMPOSE_FILE" up -d
sleep 10

echo "🔹 Step 1: Create backup of current MongoDB 4 data..."
docker exec "$CONTAINER_NAME" mongodump --username "$MONGO_USERNAME" --password "$MONGO_PASSWORD" --authenticationDatabase "$AUTH_DB" --archive=/data/db/dump.archive
docker cp "$CONTAINER_NAME":/data/db/dump.archive "$DUMP_FILE"

echo "🔹 Step 2: Shut down current MongoDB container..."
docker compose down
sleep 10

echo "🔹 Step 3: Remove old database volume so MongoDB 8 can start clean..."
docker volume rm "$VOLUME_NAME"

echo "🔹 Step 4: Update docker-compose.yml to use MongoDB 8..."
# Backup compose file
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.bak"
# Replace mongo image version
sed -i 's|mongo:4.2.24-bionic|mongo:8|g' "$COMPOSE_FILE"

echo "🔹 Step 5: Start new MongoDB 8 container..."
docker compose -f "$COMPOSE_FILE" up -d "$MONGO_SERVICE_NAME"

# Wait a bit for MongoDB to be ready
echo "⏳ Waiting for MongoDB 8 to be ready..."
sleep 20

echo "🔹 Step 6: Restore backup into MongoDB 8..."
docker cp "$DUMP_FILE" "$CONTAINER_NAME":/dump.archive
docker exec "$CONTAINER_NAME" mongorestore --username "$MONGO_USERNAME" --password "$MONGO_PASSWORD" --authenticationDatabase "$AUTH_DB" --drop --archive=/dump.archive

echo "✅ MongoDB upgraded successfully from 4 to 8 and data restored!"
