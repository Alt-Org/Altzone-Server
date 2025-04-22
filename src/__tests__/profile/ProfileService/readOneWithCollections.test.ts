import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ProfileModule from '../modules/profile.module';
import { Profile } from '../../../profile/profile.schema';
import PlayerModule from '../../player/modules/player.module';
import { PlayerDto } from '../../../player/dto/player.dto';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongooseError } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';

describe('ProfileService.readWithCollections() test suite', () => {
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

    const playerToCreate = playerBuilder
      .setProfileId(existingProfile._id)
      .build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();
  });

  it('Should retrieve profile with specified references', async () => {
    const resp = await profileService.readOneWithCollections(
      existingProfile._id,
      ModelName.PLAYER,
    );

    const data = resp['data']['Profile'].toObject();

    expect(data.Player).toEqual(expect.objectContaining(existingPlayer));
  });

  it('Should retrieve profile without references if withQuery is empty', async () => {
    const resp = await profileService.readOneWithCollections(
      existingProfile._id,
      '',
    );
    const data = resp['data']['Profile'].toObject();

    expect(data).toEqual(expect.objectContaining(existingProfile));
    expect(data.Player).toBeUndefined();
  });

  it('Should ignore non-existent references in withQuery', async () => {
    const resp = await profileService.readOneWithCollections(
      existingProfile._id,
      'NON_EXISTING',
    );
    const data = resp['data']['Profile'].toObject();

    expect(data).toEqual(expect.objectContaining(existingProfile));
    expect(data.Player).toBeUndefined();
  });

  it('Should return null if profile does not exist', async () => {
    const resp = await profileService.readOneWithCollections(
      getNonExisting_id(),
      ModelName.PLAYER,
    );
    expect(resp).toBeNull();
  });

  it('Should throw MongooseError if _id is invalid', async () => {
    await expect(
      profileService.readOneWithCollections('invalid_id', ModelName.PLAYER),
    ).rejects.toThrow(MongooseError);
  });
});
