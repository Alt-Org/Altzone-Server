import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { mongodOptions, mongooseOptions, mongoString } from './const/db';
import { ModelName } from '../../common/enum/modelName.enum';
import { ProfileSchema } from '../../profile/profile.schema';
import LoggedUser from './const/loggedUser';
import { PlayerSchema } from '../../player/player.schema';

let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create(mongodOptions);

    try {
        await mongoose.connect(mongoString, mongooseOptions);
    } catch (error) {
        console.error('Could not connect to DB', error);
    }

    // try {
    //     const profileModel = mongoose.model(ModelName.PROFILE, ProfileSchema);
    //     const defaultProfile = LoggedUser.getProfile();
    //     const {_id: profileId, ...profileToCreate} = defaultProfile;
    //     const profileResp = await profileModel.create(profileToCreate);
    //     LoggedUser.setProfile_id(profileResp._id.toString());
    
    //     const playerModel = mongoose.model(ModelName.PLAYER, PlayerSchema);
    //     const defaultPlayer = LoggedUser.getPlayer();
    //     const {_id: playerId, ...playerToCreate} = defaultPlayer;
    //     const playerResp = await playerModel.create(playerToCreate);
    //     LoggedUser.setPlayer_id(playerResp._id.toString());
    // } catch (error) {
    //     console.error('Could not insert default data to DB', error);
    // }
});

beforeEach(async () => {
    try {
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
    } catch (error) {
        console.error('Could not insert default data to DB', error);
    }
});

afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop();
});