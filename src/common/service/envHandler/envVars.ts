import * as dotenv from "dotenv";
import * as process from "node:process";
import {Environment} from "./enum/environment.enum";

dotenv.config();

// Please remember to add env name here with its description, before you add it to the record
interface EnvVars {
    /** The port on which the API runs. */
    PORT: string;

    /** Secret for JWT signings. */
    JWT_SECRET: string;

    /** For how long JWT is valid. */
    JWT_EXPIRES: string;

    /** Password setting. */
    PSW_MEMORY: string;

    /** Password setting. */
    PSW_TIME: string;

    /** Password setting. */
    PSW_PARALLELISM: string;

    /** Environment where the API runs, see Environment enum, default is PRODUCTION */
    ENVIRONMENT: string;

    /** Path where the generated swagger should be hosted, i.e. "swagger" => localhost:8080/swagger */
    SWAGGER_PATH: string;

    /** The username for MongoDB authentication. */
    MONGO_USERNAME: string;

    /** The password for MongoDB authentication. */
    MONGO_PASSWORD: string;

    /** The MongoDB host address. */
    MONGO_HOST: string;

    /** The MongoDB port number. */
    MONGO_PORT: string;

    /** The name of the MongoDB database. */
    MONGO_DB_NAME: string;

    /** The OwnCloud server host. */
    OWNCLOUD_HOST: string;

    /** The OwnCloud server port. */
    OWNCLOUD_PORT: string;

    /** The username for OwnCloud authentication. */
    OWNCLOUD_USER: string;

    /** The password for OwnCloud authentication. */
    OWNCLOUD_PASSWORD: string;

    /** Secret key for writing log files in OwnCloud. */
    OWNCLOUD_LOG_FILES_SECRET: string;

    /** The root directory in OwnCloud for log files. */
    OWNCLOUD_LOG_FILES_ROOT: string;

    /** The password for Redis authentication. */
    REDIS_PASSWORD: string;

    /** The Redis server host. */
    REDIS_HOST: string;

    /** The Redis server port. */
    REDIS_PORT: string;

    /** The Mosquitto broker host. */
    MOSQUITTO_HOST: string;

    /** The Mosquitto broker port. */
    MOSQUITTO_PORT: string;

    /** The subscriber username for Mosquitto. */
    MOSQUITTO_SUBSCRIBER: string;

    /** The password for the Mosquitto subscriber. */
    MOSQUITTO_SUBSCRIBER_PASSWORD: string;

    /** The publisher username for Mosquitto. */
    MOSQUITTO_PUBLISHER: string;

    /** The password for the Mosquitto publisher. */
    MOSQUITTO_PUBLISHER_PASSWORD: string;
}

/**
 * Record with all environment variables required by the API and loaded from .env file
 */
export const envVars: EnvVars = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES: process.env.JWT_EXPIRES,
    PSW_MEMORY: process.env.PSW_MEMORY,
    PSW_TIME: process.env.PSW_TIME,
    PSW_PARALLELISM: process.env.PSW_PARALLELISM,
    ENVIRONMENT: process.env.ENVIRONMENT ?? Environment.PRODUCTION,
    SWAGGER_PATH: process.env.SWAGGER_PATH,

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
