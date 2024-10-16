import { envVars } from '../../../common/service/envHandler/envVars';

export const mongoString = `mongodb://${envVars.MONGO_HOST}:${envVars.MONGO_PORT}/`;

export const mongooseOptions = { 
    dbName: envVars.MONGO_DB_NAME,
}

export const mongodOptions = {
    instance: {
        dbName: envVars.MONGO_DB_NAME,
        port: Number.parseInt(envVars.MONGO_PORT)
    }
}