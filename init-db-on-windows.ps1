# Run with PowerShell: .\init-db-on-windows.ps1
$ErrorActionPreference = "Stop"

$TEMP_CONTAINER_NAME = "mongo-init-temp"
$CONTAINER_NAME = "altzone_db_dev"
$SERVICE_NAME = "db_dev"
$VOLUME_NAME = "altzone_db_dev"
$MONGO_PORT = 27017
$USERNAME = "rootUser"
$PASSWORD = "superSecretPassword"
$DATABASE = "altzone_dev"
$REPLICA_NAME = "rs0"
$REPLICA_HOST = "localhost"

# Step 1: Start temp container
Write-Host "1. Starting temporary Mongo container to set volume metadata up..."
docker run -d `
  --name $TEMP_CONTAINER_NAME `
  -e "MONGO_INITDB_ROOT_USERNAME=$USERNAME" `
  -e "MONGO_INITDB_ROOT_PASSWORD=$PASSWORD" `
  -e "MONGO_INITDB_DATABASE=$DATABASE" `
  -v "${VOLUME_NAME}:/data/db" `
  -p "${MONGO_PORT}" `
  mongo:8

# Step 2: Wait for MongoDB to be ready
Write-Host "2. Waiting for MongoDB to start..."
#do {
#    Start-Sleep -Seconds 1
#    $ping = docker exec $TEMP_CONTAINER_NAME mongosh --quiet --eval "db.adminCommand('ping')" 2>&1
#} while ($ping -notmatch '"ok"\s*:\s*1')
Start-Sleep -Seconds 5

Write-Host "MongoDB volume is up. Removing the temporary container"
docker stop $TEMP_CONTAINER_NAME | Out-Null
docker rm $TEMP_CONTAINER_NAME | Out-Null

# Step 3: Start main container
Write-Host "3. Initiating replica set"
Write-Host "Starting MongoDB container with docker compose"
docker compose up -d $SERVICE_NAME

# Step 4: Wait for the container to be ready
Write-Host "Waiting for MongoDB to be ready..."
#do {
#    Start-Sleep -Seconds 1
#    $ping = docker exec $CONTAINER_NAME mongosh --quiet -u $USERNAME -p $PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>&1
#} while ($ping -notmatch '"ok"\s*:\s*1')
Start-Sleep -Seconds 5


# Step 5: Initiate replica set
Write-Host "Initiating replica set for the container..."
$initCommand = @"
rs.initiate({
  _id: '"$REPLICA_NAME"',
  members: [{ _id: 0, host: '"${REPLICA_HOST}":27017' }]
})
"@
docker exec $CONTAINER_NAME mongosh --quiet -u $USERNAME -p $PASSWORD --authenticationDatabase admin --eval $initCommand

Write-Host "Replica set initiated."

# Step 6: Shut down
Write-Host "4. Stopping and removing the container"
docker compose down

Write-Host "MongoDB container shut down. Volume is now ready for docker-compose up."
