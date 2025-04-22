import { AuthService } from '../../../auth/auth.service';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';
import ClanModule from '../../clan/modules/clan.module';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import AuthModule from '../modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

const validPassword = 'valid-password';
const hashedPassword = 'hashed-password';
jest.mock('argon2', () => ({
  verify: jest.fn(async (hashed: string, plain: string) => {
    return hashed === hashedPassword && plain === validPassword;
  }),
}));

describe('AuthService.signIn() test suite', () => {
  const validUsername = 'valid-username';
  const accessToken = 'access-token';
  const tokenExpires = new Date().getTime();

  jest.spyOn(JwtService.prototype, 'signAsync').mockResolvedValue(accessToken);
  jest
    .spyOn(JwtService.prototype, 'decode')
    .mockReturnValue({ exp: tokenExpires });

  let authService: AuthService;

  const profileModel = ProfileModule.getProfileModel();

  const existingProfile = ProfileBuilderFactory.getBuilder('Profile')
    .setUsername(validUsername)
    .setPassword(hashedPassword)
    .build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  beforeEach(async () => {
    authService = await AuthModule.getAuthService();

    const createdProfile = await profileModel.create(existingProfile);
    existingProfile._id = createdProfile._id;
  });

  it('Should return access token, expiration time, profile, player and clan data if username and password are valid', async () => {
    const clanDB = clanBuilder.build();
    const createdClanDB = await clanModel.create(clanDB);
    const clearedClan = clearDBRespDefaultFields(createdClanDB);
    const clanDBFinal = {
      ...clearedClan,
      _id: clearedClan._id.toString(),
      clanLogo: { ...clearedClan.clanLogo },
    };
    const player = playerBuilder
      .setProfileId(existingProfile._id)
      .setClanId(createdClanDB._id)
      .build();
    const createdPlayer = await playerModel.create(player);
    const clearedPlayer = clearDBRespDefaultFields(createdPlayer);
    const playerDBFinal = {
      ...clearedPlayer,
      _id: clearedPlayer._id.toString(),
      clan_id: clearedPlayer.clan_id.toString(),
      profile_id: clearedPlayer.profile_id.toString(),
    };

    const result = await authService.signIn(validUsername, validPassword);
    const clearedResult = clearDBRespDefaultFields(result);
    const clearedPlayerResult = clearDBRespDefaultFields(result['Player']);
    const clearedClanResult = clearDBRespDefaultFields(result['Clan']);

    const expectedResult = {
      accessToken,
      tokenExpires,
      _id: existingProfile._id.toString(),
      username: existingProfile.username,
    };

    expect(clearedResult).toMatchObject({
      ...expectedResult,
      Player: expect.anything(),
      Clan: expect.anything(),
    });
    expect(clearedPlayerResult).toEqual(playerDBFinal);
    expect(clearedClanResult).toEqual(clanDBFinal);
  });

  it('Should not return clan data if player is not in any clan', async () => {
    const player = playerBuilder.setProfileId(existingProfile._id).build();
    await playerModel.create(player);

    const result = await authService.signIn(validUsername, validPassword);

    expect(result['Clan']).toBeUndefined();
  });

  it('Should return null if profile does not exists', async () => {
    const result = await authService.signIn('non-existing-user', validPassword);
    expect(result).toBeNull();
  });

  it('Should return null if player does not exists', async () => {
    const result = await authService.signIn(validUsername, validPassword);
    expect(result).toBeNull();
  });

  it('Should return null if password is not valid', async () => {
    const result = await authService.signIn(validUsername, 'invalid-password');
    expect(result).toBeNull();
  });

  it('Should return null if hashed password is provided', async () => {
    const result = await authService.signIn(validUsername, hashedPassword);
    expect(result).toBeNull();
  });
});
