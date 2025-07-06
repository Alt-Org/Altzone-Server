import { TesterService } from '../../../../box/tester/tester.service';
import BoxModule from '../../modules/box.module';
import { Box } from '../../../../box/schemas/box.schema';
import ProfileModule from '../../../profile/modules/profile.module';
import PlayerModule from '../../../player/modules/player.module';
import ClanModule from '../../../clan/modules/clan.module';
import { Clan } from '../../../../clan/clan.schema';
import { ObjectId } from 'mongodb';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { Tester } from '../../../../box/schemas/tester.schema';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import ProfileBuilderFactory from '../../../profile/data/profileBuilderFactory';

describe('TesterService.deleteTesters() test suite', () => {
  let service: TesterService;
  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  let tester1: Tester;
  let tester2: Tester;
  let tester3: Tester;
  let tester4: Tester;
  let tester5: Tester;

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  const profileModel = ProfileModule.getProfileModel();
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  let boxClan1: Clan, boxClan2: Clan;

  beforeEach(async () => {
    service = await BoxModule.getTesterService();

    boxClan1 = clanBuilder.setName('clan1').build();
    const clan1Resp = await clanModel.create(boxClan1);
    boxClan1._id = clan1Resp._id;
    boxClan2 = clanBuilder.setName('clan2').build();
    const clan2Resp = await clanModel.create(boxClan2);
    boxClan2._id = clan2Resp._id;

    const testersToCreate: Tester[] = [];
    for (let i = 0; i < 5; i++) {
      const clan_id = i < 3 ? boxClan1._id : boxClan2._id;

      const profileToCreate = profileBuilder.setUsername(`player${i}`).build();
      const profileResp = await profileModel.create(profileToCreate);

      const playerToCreate = playerBuilder
        .setName(`player${i}`)
        .setUniqueIdentifier(`player${i}`)
        .setProfileId(profileResp._id)
        .setClanId(clan_id)
        .build();
      const playerResp = await playerModel.create(playerToCreate);

      testersToCreate.push(
        testerBuilder
          .setProfileId(profileResp._id as any)
          .setPlayerId(playerResp._id as any)
          .build(),
      );
    }
    [tester1, tester2, tester3, tester4, tester5] = testersToCreate;

    existingBox = boxBuilder
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setClanIds([boxClan1._id as any, boxClan2._id as any])
      .setTesters([tester1, tester2, tester3, tester4, tester5])
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should remove the specified amount of testers from box and return true', async () => {
    const amountBefore = existingBox.testers.length;
    const amount = 2;

    const [wasRemoved, errors] = await service.deleteTesters(
      existingBox._id,
      amount,
    );

    expect(errors).toBeNull();
    expect(wasRemoved).toBeTruthy();

    const boxInDB = await boxModel.findById(existingBox._id);
    const amountAfter = boxInDB.testers.length;

    expect(amountAfter).toBe(amountBefore - amount);
  });

  it('Should remove the specified amount of testers profiles and players from DB', async () => {
    const amountBefore = existingBox.testers.length;
    const amount = 2;

    await service.deleteTesters(existingBox._id, amount);

    const profilesInDB = await profileModel.find();
    const profilesAfter = profilesInDB.length - 1;
    expect(profilesAfter).toBe(amountBefore - amount);

    const playersInDB = await playerModel.find();
    const playersAfter = playersInDB.length - 1;
    expect(playersAfter).toBe(amountBefore - amount);
  });

  it('Should remove the same amount of testers from each clan if amount is an even number', async () => {
    await addTestersToClans([tester1, tester2], [tester3, tester4]);
    const testersAdded = [tester1, tester2, tester3, tester4];
    await service.deleteTesters(existingBox._id, 2);

    const testerPlayer_ids = testersAdded.map((tester) => tester.player_id);
    const playersInDB = await playerModel
      .find({ _id: { $in: testerPlayer_ids } })
      .exec();

    const amountOfPlayersInClan1 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan1._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const amountOfPlayersInClan2 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan2._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    expect(amountOfPlayersInClan1).toBe(amountOfPlayersInClan2);
  });

  it('Should remove on one tester more in one of the clans if amount is an odd number', async () => {
    await addTestersToClans([tester1, tester2], [tester3, tester4]);
    const testersAdded = [tester1, tester2, tester3, tester4];
    await service.deleteTesters(existingBox._id, 3);

    const testerPlayer_ids = testersAdded.map((tester) => tester.player_id);
    const playersInDB = await playerModel
      .find({ _id: { $in: testerPlayer_ids } })
      .exec();

    const amountOfPlayersInClan1 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan1._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const amountOfPlayersInClan2 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan2._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const playerAmountDifference = Math.abs(
      amountOfPlayersInClan1 - amountOfPlayersInClan2,
    );
    expect(playerAmountDifference).toBe(1);
  });

  it('Should remove on 1 tester more from the clan where the amount of testers is larger and the specified amount is an odd number', async () => {
    await addTestersToClans([tester1, tester2], [tester3, tester4, tester5]);
    const testersAdded = [tester1, tester2, tester3, tester4, tester5];
    await service.deleteTesters(existingBox._id, 3);

    const testerPlayer_ids = testersAdded.map((tester) => tester.player_id);
    const playersInDB = await playerModel
      .find({ _id: { $in: testerPlayer_ids } })
      .exec();

    const amountOfPlayersInClan1 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan1._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const amountOfPlayersInClan2 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id?.toString() === boxClan2._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const playerAmountDifference =
      amountOfPlayersInClan2 - amountOfPlayersInClan1;
    expect(playerAmountDifference).toBe(0);
  });

  it('Should return ServiceError NOT_ALLOWED if amount is a negative number', async () => {
    const amount = -5;

    const [wasRemoved, errors] = await service.deleteTesters(
      existingBox._id,
      amount,
    );

    expect(wasRemoved).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(amount);
  });

  it('Should not remove any profiles and players if amount is a negative number', async () => {
    const amount = -5;

    const profilesBefore = await profileModel.find();
    const playersBefore = await playerModel.find();
    await service.deleteTesters(existingBox._id, amount);
    const profilesAfter = await profileModel.find();
    const playersAfter = await playerModel.find();

    expect(profilesBefore).toHaveLength(profilesAfter.length);
    expect(playersBefore).toHaveLength(playersAfter.length);
  });

  it('Should return ServiceError NOT_ALLOWED if amount is zero', async () => {
    const amount = 0;

    const [wasRemoved, errors] = await service.deleteTesters(
      existingBox._id,
      amount,
    );

    expect(wasRemoved).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(amount);
  });

  it('Should not delete any profiles and players if amount is zero', async () => {
    const amount = 0;

    const profilesBefore = await profileModel.find();
    const playersBefore = await playerModel.find();
    await service.deleteTesters(existingBox._id, amount);
    const profilesAfter = await profileModel.find();
    const playersAfter = await playerModel.find();

    expect(profilesBefore).toHaveLength(profilesAfter.length);
    expect(playersBefore).toHaveLength(playersAfter.length);
  });

  it('Should return REQUIRED ServiceError if box_id is null', async () => {
    const [areAdded, errors] = await service.deleteTesters(null, 1);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if box_id is undefined', async () => {
    const [areAdded, errors] = await service.deleteTesters(undefined, 1);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if box_id is an empty string', async () => {
    const [areAdded, errors] = await service.deleteTesters('', 1);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe('');
  });

  it('Should return REQUIRED ServiceError if amount is null', async () => {
    const [areAdded, errors] = await service.deleteTesters(
      existingBox._id,
      null,
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if amount is undefined', async () => {
    const [areAdded, errors] = await service.deleteTesters(
      existingBox._id,
      undefined,
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if box with provided _id does not exists', async () => {
    const nonExisting_id = new ObjectId(getNonExisting_id());
    const [areAdded, errors] = await service.deleteTesters(nonExisting_id, 1);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toEqual(nonExisting_id);
  });

  it('Should return NOT_FOUND ServiceError the specified amount is larger than the actual amount of testers', async () => {
    const largerAmount = existingBox.testers.length + 10;
    const [areAdded, errors] = await service.deleteTesters(
      existingBox._id,
      largerAmount,
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(largerAmount);
  });

  /**
   * Adds specified testers to the clans
   * @param toClan1 testers to add to the clan 1
   * @param toClan2 testers to add to the clan 2
   */
  async function addTestersToClans(toClan1: Tester[], toClan2: Tester[]) {
    for (let i = 0; i < toClan1.length; i++)
      await playerModel.updateOne(
        { _id: toClan1[i].player_id },
        { clan_id: boxClan1._id },
      );

    for (let i = 0; i < toClan2.length; i++)
      await playerModel.updateOne(
        { _id: toClan2[i].player_id },
        { clan_id: boxClan2._id },
      );
  }
});
