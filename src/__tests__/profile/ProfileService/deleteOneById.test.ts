import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ProfileModule from '../modules/profile.module';
import { Profile } from '../../../profile/profile.schema';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { Player } from '../../../player/schemas/player.schema';

describe('ProfileService.deleteOneById() test suite', () => {
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

  it('Should successfully delete the profile', async () => {
    const result = await profileService.deleteOneById(existingProfile._id);

    expect(result['deletedCount']).toBe(1);
    const deletedProfile = await profileModel
      .findById(existingProfile._id)
      .exec();
    expect(deletedProfile).toBeNull();
  });

  it('Should return null if profile does not exist, and player remains unaffected', async () => {
    const nonExistingId = getNonExisting_id();

    const result = await profileService.deleteOneById(nonExistingId);

    expect(result).toBeNull();
  });

  it('Should not affect profile and player collections if profile does not exist', async () => {
    const nonExistingId = getNonExisting_id();

    await profileService.deleteOneById(nonExistingId);

    const unaffectedPlayer = await playerModel
      .findById(existingPlayer._id)
      .exec();

    expect(unaffectedPlayer).not.toBeNull();
    expect(unaffectedPlayer._id.toString()).toBe(existingPlayer._id.toString());
  });
});
