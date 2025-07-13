import './jest.matchers.d';

process.env.MONGO_DB_NAME = 'altzone_' + process.env.JEST_WORKER_ID;
process.env.PORT = '8080';
process.env.JWT_SECRET = 'mySecret';
process.env.JWT_EXPIRES = '2d';

process.env.PSW_MEMORY = '1300';
process.env.PSW_TIME = '1';
process.env.PSW_PARALLELISM = '6';
process.env.ENVIRONMENT = 'PRODUCTION';
process.env.SWAGGER_PATH = 'path';
process.env.SWAGGER_USER = 'username';
process.env.SWAGGER_PASSWORD = 'password';

process.env.MIN_GAME_BUILD_VERSION = '155';

process.env.MONGO_USERNAME = 'username';
process.env.MONGO_PASSWORD = 'password';
process.env.MONGO_HOST = 'localhost';
process.env.MONGO_PORT = '27017';

process.env.OWNCLOUD_HOST = 'localhost';
process.env.OWNCLOUD_PORT = '8082';
process.env.OWNCLOUD_USER = 'user';
process.env.OWNCLOUD_PASSWORD = 'password';
process.env.OWNCLOUD_LOG_FILES_SECRET = 'password';
process.env.OWNCLOUD_LOG_FILES_ROOT = '/root-of-files';

process.env.REDIS_PASSWORD = 'password';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

process.env.MOSQUITTO_HOST = 'localhost';
process.env.MOSQUITTO_PORT = '1883';
process.env.MOSQUITTO_SUBSCRIBER = 'username-1';
process.env.MOSQUITTO_SUBSCRIBER_PASSWORD = 'password';
process.env.MOSQUITTO_PUBLISHER = 'username-2';
process.env.MOSQUITTO_PUBLISHER_PASSWORD = 'password';
