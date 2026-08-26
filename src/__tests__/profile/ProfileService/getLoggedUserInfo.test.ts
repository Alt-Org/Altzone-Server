import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import ProfileModule from '../modules/profile.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { Profile } from '../../../profile/profile.schema';
import { Player } from '../../../player/schemas/player.schema';

describe('ProfileService.getLoggedUserInfo() test suite', () => {
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

  it('Should return hasSecurityQuestion true if profile has securityQuestion', async () => {
    await profileModel.updateOne(
      { _id: existingProfile._id },
      { securityQuestion: 'What is your favorite color?' },
    );

    const [profile, errors] = await profileService.getLoggedUserInfo(
      existingProfile._id,
      existingPlayer._id,
    );

    expect(errors).toBeNull();
    expect(profile.hasSecurityQuestion).toBe(true);
  });

  it('Should return hasSecurityQuestion false if profile does not have securityQuestion', async () => {
    const [profile, errors] = await profileService.getLoggedUserInfo(
      existingProfile._id,
      existingPlayer._id,
    );

    expect(errors).toBeNull();
    expect(profile.hasSecurityQuestion).toBe(false);
  });
});
