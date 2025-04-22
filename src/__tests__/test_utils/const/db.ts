import { envVars } from '../../../common/service/envHandler/envVars';

export const mongoString = process.env.TEST_MONGO_URI;

export const mongooseOptions = {
  dbName: envVars.MONGO_DB_NAME,
};

export const mongodOptions = {
  instance: {
    dbName: envVars.MONGO_DB_NAME,
  },
};
