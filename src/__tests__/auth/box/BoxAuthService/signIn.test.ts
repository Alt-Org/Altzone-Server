import { JwtService } from '@nestjs/jwt';
import ProfileModule from '../../../profile/modules/profile.module';
import ProfileBuilderFactory from '../../../profile/data/profileBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import BoxModule from '../../../box/modules/box.module';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import BoxBuilderFactory from '../../../box/data/boxBuilderFactory';
import { ObjectId } from 'mongodb';
import { Box } from '../../../../box/schemas/box.schema';
import BoxAuthService from '../../../../auth/box/BoxAuthService';
import AuthModule from '../../modules/auth.module';

const validPassword = 'valid-password';
const hashedPassword = 'hashed-password';
jest.mock('argon2', () => ({
  verify: jest.fn(async (hashed: string, plain: string) => {
    return hashed === hashedPassword && plain === validPassword;
  }),
}));

describe('BoxAuthService.signIn() test suite', () => {
  const validUsername = 'valid-username';
  const accessToken = 'access-token';
  const tokenExpires = new Date().getTime();

  const signAsyncSpy = jest
    .spyOn(JwtService.prototype, 'signAsync')
    .mockResolvedValue(accessToken);
  jest
    .spyOn(JwtService.prototype, 'decode')
    .mockReturnValue({ exp: tokenExpires });

  let boxAuthService: BoxAuthService;

  const profileModel = ProfileModule.getProfileModel();

  const existingAdminProfile = ProfileBuilderFactory.getBuilder('Profile')
    .setUsername(validUsername)
    .setPassword(hashedPassword)
    .build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  const groupAdminModel = BoxModule.getGroupAdminModel();
  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  const existingAdmin = adminBuilder.build();

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  beforeEach(async () => {
    boxAuthService = await AuthModule.getBoxAuthService();

    const createdProfile = await profileModel.create(existingAdminProfile);
    existingAdminProfile._id = createdProfile._id;

    const adminResp = await groupAdminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    existingBox = boxBuilder
      .setAdminPassword(existingAdmin.password)
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId(existingAdminProfile._id))
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
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
      .setProfileId(existingAdminProfile._id)
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

    const result = await boxAuthService.signIn(validUsername, validPassword);
    const clearedResult = clearDBRespDefaultFields(result);
    const clearedPlayerResult = {
      ...clearDBRespDefaultFields(result['Player']),
      _id: result['Player']._id.toString(),
      profile_id: result['Player'].profile_id.toString(),
      clan_id: result['Player'].clan_id.toString(),
    };
    const clearedClanResult = clearDBRespDefaultFields(result['Clan']);

    const expectedResult = {
      accessToken,
      tokenExpires,
      _id: existingAdminProfile._id.toString(),
      username: existingAdminProfile.username,
    };

    expect(clearedResult).toMatchObject({
      ...expectedResult,
      Player: expect.anything(),
      Clan: expect.anything(),
    });
    expect(clearedPlayerResult).toEqual(playerDBFinal);
    expect(clearedClanResult).toMatchObject(clanDBFinal);
  });

  it('Should call signAsync() with payload containing profile_id, player_id, box_id, groupAdmin', async () => {
    const player = playerBuilder.setProfileId(existingAdminProfile._id).build();
    const createdPlayer = await playerModel.create(player);

    await boxAuthService.signIn(validUsername, validPassword);

    const expectedPayload = {
      profile_id: existingAdminProfile._id.toString(),
      player_id: createdPlayer._id.toString(),
      box_id: existingBox._id.toString(),
      groupAdmin: true,
    };

    expect(signAsyncSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should call signAsync() with payload containing groupAdmin set to true if the profile is group admin', async () => {
    const player = playerBuilder.setProfileId(existingAdminProfile._id).build();
    const createdPlayer = await playerModel.create(player);

    await boxAuthService.signIn(validUsername, validPassword);

    const expectedPayload = {
      profile_id: existingAdminProfile._id.toString(),
      player_id: createdPlayer._id.toString(),
      box_id: existingBox._id.toString(),
      groupAdmin: true,
    };

    expect(signAsyncSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should not return clan data if player is not in any clan', async () => {
    const player = playerBuilder.setProfileId(existingAdminProfile._id).build();
    await playerModel.create(player);

    const result = await boxAuthService.signIn(validUsername, validPassword);

    expect(result['Clan']).toBeUndefined();
  });

  it('Should return null if profile does not exists', async () => {
    const result = await boxAuthService.signIn(
      'non-existing-user',
      validPassword,
    );
    expect(result).toBeNull();
  });

  it('Should return null if player does not exists', async () => {
    const result = await boxAuthService.signIn(validUsername, validPassword);
    expect(result).toBeNull();
  });

  it('Should return null if password is not valid', async () => {
    const result = await boxAuthService.signIn(
      validUsername,
      'invalid-password',
    );
    expect(result).toBeNull();
  });

  it('Should return null if hashed password is provided', async () => {
    const result = await boxAuthService.signIn(validUsername, hashedPassword);
    expect(result).toBeNull();
  });
});
