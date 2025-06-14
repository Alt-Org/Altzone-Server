import ServiceError from '../../../common/service/basicService/ServiceError';
import { PlayerService } from '../../../player/player.service';
import { ProfileService } from '../../../profile/profile.service';
import ProfileModule from '../modules/profile.module';

describe('ProfileService.createGuestAccount() test suite', () => {
  let profileService: ProfileService;

  let playerService: PlayerService;

  const profileModel = ProfileModule.getProfileModel();

  const playerModel = ProfileModule.getPlayerModel();

  beforeEach(async () => {
    jest.clearAllMocks();

    profileService = await ProfileModule.getProfileService();
    playerService = await ProfileModule.getPlayerService();
  });

  it('Should create a profile and a player in the DB', async () => {
    const [result, errors] = (await profileService.createGuestAccount()) as [
      {
        username: string;
        password: string;
      },
      null,
    ];

    const profile = await profileModel.findOne({ username: result.username });

    const player = await playerModel.findOne({ name: profile.username });

    expect(errors).toBeNull();

    expect(profile).toBeDefined();
    expect(profile.isGuest).toBe(true);
    expect(profile.username).toMatch(/guest-account-/);
    expect(profile.password).not.toBeNull();

    expect(player).toBeDefined();
    expect(player.profile_id.toString()).toBe(profile._id.toString());
    expect(player.name).toBe(profile.username);
    expect(player.uniqueIdentifier).toBe(profile.username);
    expect(result.username).toBe(profile.username);

    await profileModel.deleteOne({ username: result.username });
  });

  it('Should return with error if was not possible to create the profile', async () => {
    jest
      .spyOn(profileService, 'createWithHashedPassword')
      .mockImplementation(async () => {
        return [
          null,
          [new ServiceError({ message: 'Event is not supported' })],
        ];
      });

    const result = await profileService.createGuestAccount();

    expect(result[0]).toBeNull();
    expect(result[1]).toBeDefined();
    expect(result[1][0].message).toBe('Event is not supported');
  });

  it('Should return with exception if was not possible to create the player', async () => {
    jest.spyOn(playerService, 'createOne').mockImplementation(async () => {
      throw new Error();
    });

    try {
      await profileService.createGuestAccount();
    } catch (error) {
      expect(error).toBeDefined();
    }

    const profile = await profileModel.find({ isGuest: true });

    expect(profile).toHaveLength(0);
  });
});
