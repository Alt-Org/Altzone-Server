import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ProfileModule from '../modules/profile.module';
import { Profile } from '../../../profile/profile.schema';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongooseError } from 'mongoose';
import { Player } from '../../../player/schemas/player.schema';

describe('ProfileService.readOneWithAllCollections() test suite', () => {
  let profileService: ProfileService;
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  let existingProfile: Profile;

  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  let existingPlayer: Player;

  const profileModel = ProfileModule.getProfileModel();

  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
    const profileToCreate = profileBuilder.build();
    const profileResp = await profileModel.create(profileToCreate);
    existingProfile = profileResp.toObject();

    const playerToCreate = playerBuilder
      .setProfileId(existingProfile._id)
      .build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();
  });

  it('Should retrieve profile with all collections populated', async () => {
    const resp = await profileService.readOneWithAllCollections(
      existingProfile._id,
    );
    const data = resp['data']['Profile'].toObject();

    expect(data.Player).toEqual(expect.objectContaining(existingPlayer));
  });

  it('Should return null if profile does not exist', async () => {
    const resp =
      await profileService.readOneWithAllCollections(getNonExisting_id());
    expect(resp).toBeNull();
  });

  it('Should throw MongooseError if _id is invalid', async () => {
    await expect(
      profileService.readOneWithAllCollections('invalid_id'),
    ).rejects.toThrow(MongooseError);
  });
});
