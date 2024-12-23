import './jest.matchers.d';

process.env.MONGO_DB_NAME = 'altzone_' + process.env.JEST_WORKER_ID;