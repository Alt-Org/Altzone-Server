import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { mongoString } from './const/db';
import { ModelName } from '../../common/enum/modelName.enum';
import { ProfileSchema } from '../../profile/profile.schema';
import LoggedUser from './const/loggedUser';
import { PlayerSchema } from '../../player/player.schema';
import { envVars } from '../../common/service/envHandler/envVars';

let mongod: MongoMemoryServer;

beforeAll(async () => {
    const dbName = `altzone_${process.env.JEST_WORKER_ID}`;

    mongod = await MongoMemoryServer.create({
        instance: {
            dbName: dbName,
            port: Number.parseInt(envVars.MONGO_PORT)
        }
    });

    try {
        await mongoose.connect(mongoString, {dbName: dbName});
    } catch (error) {
        console.error('beforeAll() global: Could not connect to DB', error);
    }
});

beforeEach(async () => {
    try {
        await initDB();
    } catch (error) {
        console.error('beforeEach() global: Could not init DB before test', error);
    }
    
});

afterEach(async () => {
    try {
        await clearDB();
    } catch (error) {
        console.error('afterEach() global: Could not clean DB after test', error);
    }
});

afterAll(async () => {
    try {
        await mongoose.disconnect();
        await mongod.stop();
    } catch (error) {
        console.error('afterAll() global: Could not stop DB after all tests', error);
    }
});

/**
 * Inserts default data to DB, such as default profile and player
 */
async function initDB() {
    const profileModel = mongoose.model(ModelName.PROFILE, ProfileSchema);
    const defaultProfile = LoggedUser.getProfile();
    const {_id: profileId, ...profileToCreate} = defaultProfile;
    const profileResp = await profileModel.create(profileToCreate);
    LoggedUser.setProfile_id(profileResp._id.toString());

    const playerModel = mongoose.model(ModelName.PLAYER, PlayerSchema);
    const defaultPlayer = LoggedUser.getPlayer();
    const {_id: playerId, ...playerToCreate} = defaultPlayer;
    const playerResp = await playerModel.create(playerToCreate);
    LoggedUser.setPlayer_id(playerResp._id.toString());
}

/**
 * Removes all documents from all collections from DB
 */
async function clearDB(){
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
};