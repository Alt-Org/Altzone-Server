import {ProfileService} from "../../../profile/profile.service";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import ProfileModule from "../modules/profile.module";
import {PlayerDto} from "../../../player/dto/player.dto";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import PlayerModule from "../../player/modules/player.module";
import {Profile} from "../../../profile/profile.schema";
import {getNonExisting_id} from "../../test_utils/util/getNonExisting_id";
import {MongooseError} from "mongoose";
import {ModelName} from "../../../common/enum/modelName.enum";

describe('ProfileService.readOneById() test suite', () => {
    let profileService: ProfileService;
    const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
    let existingProfile: Profile;

    const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
    const playerModel = PlayerModule.getPlayerModel();
    let existingPlayer: PlayerDto;

    const profileModel = ProfileModule.getProfileModel();

    beforeEach(async () => {
        profileService = await ProfileModule.getProfileService();
        const profileToCreate = profileBuilder.build();
        const profileResp = await profileModel.create(profileToCreate);
        existingProfile = profileResp.toObject();

        const playerToCreate = playerBuilder.setProfileId(existingProfile._id).build();
        const playerResp = await playerModel.create(playerToCreate);
        existingPlayer = playerResp.toObject();
    });

    it('Should find existing profile from DB', async () => {
         const resp = await profileService.readOneById(existingProfile._id);

        const data = resp['data']['Profile'].toObject();

        expect(data).toEqual(expect.objectContaining(existingProfile));
    });

    it('Should return null for non-existing profile', async () => {
        const resp = await profileService.readOneById(getNonExisting_id());

        expect(resp).toBeNull();
    });

    it('Should throw MongooseError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        await expect(profileService.readOneById(invalid_id)).rejects.toThrow(MongooseError);
    });

    it('Should get profile collection references if they exists in schema', async () => {
        const resp = await profileService.readOneById(existingProfile._id, [ ModelName.PLAYER ]);

        const data = resp['data']['Profile'].toObject();

        expect(data.Player).toEqual(expect.objectContaining(existingPlayer));
    });

    it('Should throw MongooseError if non-existing references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];

        await expect(profileService.readOneById(existingProfile._id, nonExistingReferences)).rejects.toThrow(MongooseError);
    });
});