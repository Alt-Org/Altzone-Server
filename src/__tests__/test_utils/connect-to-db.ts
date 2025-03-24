import mongoose from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ProfileSchema } from '../../profile/profile.schema';
import LoggedUser from './const/loggedUser';
import { PlayerSchema } from '../../player/player.schema';
import './jest.matchers.d';
import { mongooseOptions, mongoString } from './const/db';

beforeAll(async () => {
    try {
        await mongoose.connect(mongoString, mongooseOptions);
    } catch (error) {
        console.error('beforeAll() global: Could not connect to DB', error);
        throw error;
    }
});

beforeEach(async () => {
    try {
        await initDB();
    } catch (error) {
        console.error('beforeEach() global: Could not init DB before test', error);
        throw error;
    }
});

afterEach(async () => {
    try {
        await clearDB();
    } catch (error) {
        console.error('afterEach() global: Could not clean DB after test', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        //await mongoose.disconnect();
    } catch (error) {
        console.error('afterAll() global: Could not stop DB after all tests', error);
        throw error;
    }
});

/**
 * Inserts default data to DB, such as default profile and player
 */
async function initDB() {
    const profileModel = mongoose.model(ModelName.PROFILE, ProfileSchema);
    const defaultProfile = LoggedUser.getProfile();
    const {_id: _profileId, ...profileToCreate} = defaultProfile;
    const profileResp = await profileModel.create(profileToCreate);
    LoggedUser.setProfile_id(profileResp._id.toString());

    const playerModel = mongoose.model(ModelName.PLAYER, PlayerSchema);
    const defaultPlayer = LoggedUser.getPlayer();
    const {_id: _playerId, ...playerToCreate} = defaultPlayer;
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