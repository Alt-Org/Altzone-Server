import * as dotenv from "dotenv";

dotenv.config();

// Please remember to add env name here, before you add it to the record
type EnvName =
    'PORT' | 'JWT_SECRET' | 'JWT_EXPIRES' |
    'MONGO_USERNAME' | 'MONGO_PASSWORD' | 'MONGO_HOST' | 'MONGO_PORT' | 'MONGO_DB_NAME' | 
    'OWNCLOUD_HOST' | 'OWNCLOUD_PORT' | 'OWNCLOUD_USER' | 'OWNCLOUD_PASSWORD' | 'OWNCLOUD_LOG_FILES_SECRET' | 'OWNCLOUD_LOG_FILES_ROOT' | 
    'REDIS_PASSWORD' | 'REDIS_HOST' | 'REDIS_PORT' | 
    'MOSQUITTO_HOST' | 'MOSQUITTO_PORT' | 'MOSQUITTO_SUBSCRIBER' | 'MOSQUITTO_SUBSCRIBER_PASSWORD' | 'MOSQUITTO_PUBLISHER' | 'MOSQUITTO_PUBLISHER_PASSWORD';

/**
 * Record with all environment variables required by the API and loaded from .env file
 * @property PORT - The port on which the API runs.
 * @property JWT_SECRET - Secret for JWT signings.
 * @property JWT_EXPIRES - For how long JWT is valid.
 * @property MONGO_USERNAME - The username for MongoDB authentication.
 * @property MONGO_PASSWORD - The password for MongoDB authentication.
 * @property MONGO_HOST - The MongoDB host address.
 * @property MONGO_PORT - The MongoDB port number.
 * @property MONGO_DB_NAME - The name of the MongoDB database.
 * @property OWNCLOUD_HOST - The OwnCloud server host.
 * @property OWNCLOUD_PORT - The OwnCloud server port.
 * @property OWNCLOUD_USER - The username for OwnCloud authentication.
 * @property OWNCLOUD_PASSWORD - The password for OwnCloud authentication.
 * @property OWNCLOUD_LOG_FILES_SECRET - Secret key for writing log files in OwnCloud.
 * @property OWNCLOUD_LOG_FILES_ROOT - The root directory in OwnCloud for log files.
 * @property REDIS_PASSWORD - The password for Redis authentication.
 * @property REDIS_HOST - The Redis server host.
 * @property REDIS_PORT - The Redis server port.
 * @property MOSQUITTO_HOST - The Mosquitto broker host.
 * @property MOSQUITTO_PORT - The Mosquitto broker port.
 * @property MOSQUITTO_SUBSCRIBER - The subscriber username for Mosquitto.
 * @property MOSQUITTO_SUBSCRIBER_PASSWORD - The password for the Mosquitto subscriber.
 * @property MOSQUITTO_PUBLISHER - The publisher username for Mosquitto.
 * @property MOSQUITTO_PUBLISHER_PASSWORD - The password for the Mosquitto publisher.
 */
export const envVars: Record<EnvName, string> = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES: process.env.JWT_EXPIRES,

    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_HOST: process.env.MONGO_HOST,
    MONGO_PORT: process.env.MONGO_PORT,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,

    OWNCLOUD_HOST: process.env.OWNCLOUD_HOST,
    OWNCLOUD_PORT: process.env.OWNCLOUD_PORT,
    OWNCLOUD_USER: process.env.OWNCLOUD_USER,
    OWNCLOUD_PASSWORD: process.env.OWNCLOUD_PASSWORD,
    OWNCLOUD_LOG_FILES_SECRET: process.env.OWNCLOUD_LOG_FILES_SECRET,
    OWNCLOUD_LOG_FILES_ROOT: process.env.OWNCLOUD_LOG_FILES_ROOT,

    REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "mySecretPassword",
    REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
    REDIS_PORT: process.env.REDIS_PORT ?? "6379",

    MOSQUITTO_HOST: process.env.MOSQUITTO_HOST,
    MOSQUITTO_PORT: process.env.MOSQUITTO_PORT,
    MOSQUITTO_SUBSCRIBER: process.env.MOSQUITTO_SUBSCRIBER,
    MOSQUITTO_SUBSCRIBER_PASSWORD: process.env.MOSQUITTO_SUBSCRIBER_PASSWORD,
    MOSQUITTO_PUBLISHER: process.env.MOSQUITTO_PUBLISHER,
    MOSQUITTO_PUBLISHER_PASSWORD: process.env.MOSQUITTO_PUBLISHER_PASSWORD
}