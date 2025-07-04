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
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { TesterAccountService } from '../../../../box/accountClaimer/testerAccount.service';
import Tester from '../../../../box/accountClaimer/payloads/tester';

describe('TesterAccountService.addTestersToClans() test suite', () => {
  let service: TesterAccountService;
  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  let tester1: Tester;
  let tester2: Tester;
  let tester3: Tester;
  let tester4: Tester;
  let tester5: Tester;

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  let boxClan1: Clan, boxClan2: Clan;

  beforeEach(async () => {
    service = await BoxModule.getTesterAccountService();

    boxClan1 = clanBuilder.setName('clan1').build();
    const clan1Resp = await clanModel.create(boxClan1);
    boxClan1._id = clan1Resp._id;
    boxClan2 = clanBuilder.setName('clan2').build();
    const clan2Resp = await clanModel.create(boxClan2);
    boxClan2._id = clan2Resp._id;

    const testersToCreate: Tester[] = [];
    for (let i = 0; i < 5; i++) {
      const playerToCreate = playerBuilder
        .setName(`player${i}`)
        .setUniqueIdentifier(`player${i}`)
        .setProfileId(new ObjectId())
        .build();
      const playerResp = await playerModel.create(playerToCreate);

      testersToCreate.push(testerBuilder.build());
    }
    [tester1, tester2, tester3, tester4, tester5] = testersToCreate;

    existingBox = boxBuilder
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setClanIds([boxClan1._id as any, boxClan2._id as any])
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should add specified testers to the box clans and return true', async () => {
    const testersToAdd = [tester1, tester2];
    const [areAdded, errors] = await service.addTestersToClans(
      existingBox._id,
      testersToAdd,
    );

    const player1InDB = await playerModel.findById(tester1.Player._id);
    const player2InDB = await playerModel.findById(tester2.Player._id);

    expect(errors).toBeNull();
    expect(areAdded).toBeTruthy();

    const player1HasRightClan_id =
      player1InDB.clan_id?.toString() === boxClan1._id.toString() ||
      player1InDB.clan_id?.toString() === boxClan2._id.toString();
    expect(player1HasRightClan_id).toBeTruthy();

    const player2HasRightClan_id =
      player2InDB.clan_id.toString() === boxClan1._id.toString() ||
      player2InDB.clan_id.toString() === boxClan2._id.toString();
    expect(player2HasRightClan_id).toBeTruthy();

    expect(player1InDB.clan_id.toString()).not.toBe(
      player2InDB.clan_id.toString(),
    );
  });

  it('Should add testers evenly to the box clans if the amount of testers is even', async () => {
    const testersToAdd = [tester1, tester2, tester3, tester4];
    await service.addTestersToClans(existingBox._id, testersToAdd);

    const testerPlayer_ids = testersToAdd.map((tester) => tester.Player._id);
    const playersInDB = await playerModel
      .find({ _id: { $in: testerPlayer_ids } })
      .exec();

    const amountOfPlayersInClan1 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id.toString() === boxClan1._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const amountOfPlayersInClan2 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id.toString() === boxClan2._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    expect(amountOfPlayersInClan1 + amountOfPlayersInClan2).toBe(
      testersToAdd.length,
    );
    expect(amountOfPlayersInClan1).toBe(amountOfPlayersInClan2);
  });

  it('Should add on 1 tester more to one of the box clans if the amount of testers is odd', async () => {
    const testersToAdd = [tester1, tester2, tester3, tester4, tester5];
    await service.addTestersToClans(existingBox._id, testersToAdd);

    const testerPlayer_ids = testersToAdd.map((tester) => tester.Player._id);
    const playersInDB = await playerModel
      .find({ _id: { $in: testerPlayer_ids } })
      .exec();

    const amountOfPlayersInClan1 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id.toString() === boxClan1._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    const amountOfPlayersInClan2 = playersInDB.reduce(
      (prevAmount, player) =>
        player.clan_id.toString() === boxClan2._id.toString()
          ? ++prevAmount
          : prevAmount,
      0,
    );

    expect(amountOfPlayersInClan1 + amountOfPlayersInClan2).toBe(
      testersToAdd.length,
    );
    const playerAmountDifference = Math.abs(
      amountOfPlayersInClan1 - amountOfPlayersInClan2,
    );
    expect(playerAmountDifference).toBe(1);
  });

  it('Should return REQUIRED ServiceError if box_id is null', async () => {
    const [areAdded, errors] = await service.addTestersToClans(null, [tester1]);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if box_id is undefined', async () => {
    const [areAdded, errors] = await service.addTestersToClans(undefined, [
      tester1,
    ]);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if box_id is an empty string', async () => {
    const [areAdded, errors] = await service.addTestersToClans('', [tester1]);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toBe('');
  });

  it('Should return REQUIRED ServiceError if testers is null', async () => {
    const [areAdded, errors] = await service.addTestersToClans(
      existingBox._id,
      null,
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('testers');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if testers is undefined', async () => {
    const [areAdded, errors] = await service.addTestersToClans(
      existingBox._id,
      undefined,
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('testers');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if testers is an empty array', async () => {
    const [areAdded, errors] = await service.addTestersToClans(
      existingBox._id,
      [],
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('testers');
    expect(errors[0].value).toEqual([]);
  });

  it('Should return NOT_FOUND ServiceError if box with provided _id does not exists', async () => {
    const nonExisting_id = new ObjectId(getNonExisting_id());
    const [areAdded, errors] = await service.addTestersToClans(nonExisting_id, [
      tester1,
    ]);

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('box_id');
    expect(errors[0].value).toEqual(nonExisting_id);
  });

  it('Should return NOT_FOUND ServiceError if box does not have 2 clans', async () => {
    const box_clans = [boxClan1._id];
    await boxModel.findByIdAndUpdate(existingBox._id, { clan_ids: box_clans });
    const [areAdded, errors] = await service.addTestersToClans(
      existingBox._id,
      [tester1],
    );

    expect(areAdded).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('clan_ids');
    expect(errors[0].value).toEqual(box_clans);
  });
});
