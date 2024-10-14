import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { envVars } from '../../common/service/envHandler/envVars';

//Establishing connection

let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
        // auth: {
        //     customRootName: envVars.MONGO_USERNAME,
        //     customRootPwd: envVars.MONGO_PASSWORD
        // },
        instance: {
            dbName: envVars.MONGO_DB_NAME,
            port: Number.parseInt(envVars.MONGO_PORT)
        }
    });
});

beforeEach(async () => {
    await mongoose.connect(mongod.getUri(), { 
        dbName: envVars.MONGO_DB_NAME, 
        // auth: { 
        //     username: envVars.MONGO_USERNAME, 
        //     password: envVars.MONGO_PASSWORD 
        // }
    });
});

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop();
});