import { envVars } from '../../../common/service/envHandler/envVars';

export const mongoString = `mongodb://${envVars.MONGO_USERNAME}:${envVars.MONGO_PASSWORD}@${envVars.MONGO_HOST}:${envVars.MONGO_PORT}/`;

export const mongooseOptions = { 
    dbName: envVars.MONGO_DB_NAME, 
    auth: { 
        username: envVars.MONGO_USERNAME, 
        password: envVars.MONGO_PASSWORD 
    }
}

export const mongodOptions = {
    auth: {
        customRootName: envVars.MONGO_USERNAME,
        customRootPwd: envVars.MONGO_PASSWORD,
        enable: true
    },
    instance: {
        dbName: envVars.MONGO_DB_NAME,
        port: Number.parseInt(envVars.MONGO_PORT)
    }
}