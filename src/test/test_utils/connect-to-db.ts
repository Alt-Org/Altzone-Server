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
        console.error('Could not connect to DB', error);
    }
});

beforeEach(async () => {
    await initDB();
});

afterEach(async () => {
    await clearDB();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});


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

async function clearDB(){
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
};