import BoxModule from '../../modules/box.module';
import PlayerModule from '../../../player/modules/player.module';
import ClanModule from '../../../clan/modules/clan.module';
import { ObjectId } from 'mongodb';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { TesterAccountService } from '../../../../box/accountClaimer/testerAccount.service';
import PlayerBuilder from '../../../player/data/player/playerBuilder';
import ClanBuilder from '../../../clan/data/clan/ClanBuilder';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';

describe('TesterAccountService.addTesterToClan() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;
  let service: TesterAccountService;

  const playerModel = PlayerModule.getPlayerModel();
  let playerBuilder: PlayerBuilder;

  const clanModel = ClanModule.getClanModel();
  let clanBuilder: ClanBuilder;

  beforeEach(async () => {
    service = await BoxModule.getTesterAccountService();
    playerBuilder = PlayerBuilderFactory.getBuilder('Player');
    clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  });

  it('Should add specified tester to one of the clans', async () => {
    const tester_ids = await createPlayers(1);
    const tester_id = tester_ids[0];
    const clan_ids = await createClans(1);
    const clan_id = clan_ids[0];

    const clanBefore = await clanModel.findById(clan_id);

    await service.addTesterToClan(tester_id, [clan_id]);

    const clanAfter = await clanModel.findById(clan_id);
    const playerAfter = await playerModel.findById(tester_id);

    expect(playerAfter.clan_id).not.toBeNull();
    expect(clanAfter.playerCount).toBe(clanBefore.playerCount + 1);
    expect(playerAfter.clan_id.toString()).toEqual(clanAfter._id.toString());
  });

  it('Should return clan where the tester was put', async () => {
    const tester_ids = await createPlayers(1);
    const tester_id = tester_ids[0];
    const clan_ids = await createClans(2);

    const [testerClan, errors] = await service.addTesterToClan(
      tester_id,
      clan_ids,
    );

    const playerInDB = await playerModel.findById(tester_id);

    expect(errors).toBeNull();
    expect(testerClan).not.toBeNull();
    expect(clan_ids).toContain(testerClan._id.toString());
    expect(testerClan._id.toString()).toEqual(playerInDB.clan_id.toString());
  });

  it('Should add tester to a clan with least amount of players', async () => {
    const tester_ids = await createPlayers(1);
    const tester_id = tester_ids[0];
    const clan_ids = await createClans(2);

    await clanModel.findByIdAndUpdate(clan_ids[0], { playerCount: 2 });
    await clanModel.findByIdAndUpdate(clan_ids[1], { playerCount: 0 });

    const [testerClan, errors] = await service.addTesterToClan(
      tester_id,
      clan_ids,
    );

    const playerInDB = await playerModel.findById(tester_id);
    const expectedClan_id = clan_ids[1];

    expect(errors).toBeNull();
    expect(testerClan._id.toString()).toBe(expectedClan_id);
    expect(playerInDB.clan_id.toString()).toBe(expectedClan_id);
  });

  it('Should add tester to a clan if all of the clans have the same amount of players', async () => {
    const tester_ids = await createPlayers(1);
    const tester_id = tester_ids[0];
    const clan_ids = await createClans(2);

    await clanModel.findByIdAndUpdate(clan_ids[0], { playerCount: 2 });
    await clanModel.findByIdAndUpdate(clan_ids[1], { playerCount: 2 });

    await service.addTesterToClan(tester_id, clan_ids);

    const playerInDB = await playerModel.findById(tester_id);
    expect(playerInDB.clan_id).not.toBeNull();
  });

  it('Should add tester to a clan if all of the clans have no players in them', async () => {
    const tester_ids = await createPlayers(1);
    const tester_id = tester_ids[0];
    const clan_ids = await createClans(2);

    await clanModel.findByIdAndUpdate(clan_ids[0], { playerCount: 0 });
    await clanModel.findByIdAndUpdate(clan_ids[1], { playerCount: 0 });

    await service.addTesterToClan(tester_id, clan_ids);

    const playerInDB = await playerModel.findById(tester_id);
    expect(playerInDB.clan_id).not.toBeNull();
  });

  it('Should add testers evenly to the clans, if there are 40 testers and 2 clans', async () => {
    const testersAmount = 40;
    const clansAmount = 2;
    const expectedAmountOfPlayers = testersAmount / clansAmount;
    const tester_ids = await createPlayers(testersAmount);
    const clan_ids = await createClans(clansAmount);

    await runAddTesterToClanAsync(tester_ids, clan_ids);

    const clansAfter = await clanModel.find({ _id: { $in: clan_ids } });

    for (const clan of clansAfter)
      expect(clan.playerCount).toBe(expectedAmountOfPlayers);
  });

  it('Should add on 1 tester more to one of the clans, if there are 13 testers and 3 clans', async () => {
    const testersAmount = 13;
    const clansAmount = 3;
    const maxAmountOfPlayers = Math.floor(testersAmount / clansAmount);
    const tester_ids = await createPlayers(testersAmount);
    const clan_ids = await createClans(clansAmount);

    await runAddTesterToClanAsync(tester_ids, clan_ids);

    const clansAfter = await clanModel.find({ _id: { $in: clan_ids } });
    const clansWithMorePlayers = clansAfter.filter(
      (player) => player.playerCount === maxAmountOfPlayers + 1,
    );

    expect(clansWithMorePlayers).toHaveLength(1);
  });

  it('Should left one clan without a tester, if there are 3 testers and 4 clans', async () => {
    const testersAmount = 3;
    const clansAmount = 4;
    const maxAmountOfPlayers = Math.ceil(testersAmount / clansAmount);
    const tester_ids = await createPlayers(testersAmount);
    const clan_ids = await createClans(clansAmount);

    await runAddTesterToClanAsync(tester_ids, clan_ids);

    const clansAfter = await clanModel.find({ _id: { $in: clan_ids } });
    const clansWithLessPlayers = clansAfter.filter(
      (player) => player.playerCount === maxAmountOfPlayers - 1,
    );

    expect(clansWithLessPlayers).toHaveLength(1);
  });

  it('Should add exactly one tester to each clan, if there are 10 testers and 10 clans', async () => {
    const testersAmount = 10;
    const clansAmount = 10;
    const expectedAmountOfPlayers = testersAmount / clansAmount;
    const tester_ids = await createPlayers(testersAmount);
    const clan_ids = await createClans(clansAmount);

    await runAddTesterToClanAsync(tester_ids, clan_ids);

    const clansAfter = await clanModel.find({ _id: { $in: clan_ids } });

    for (const clan of clansAfter)
      expect(clan.playerCount).toBe(expectedAmountOfPlayers);
  });

  it('Should add all testers to one clan, if there are 5 testers and 1 clan', async () => {
    const tester_ids = await createPlayers(5);
    const clan_ids = await createClans(1);

    await runAddTesterToClanAsync(tester_ids, clan_ids);

    const clanAfter = await clanModel.findById(clan_ids[0]);
    expect(clanAfter.playerCount).toBe(5);
  });

  it('Should return REQUIRED ServiceError if player_id is null', async () => {
    const clan_ids = await createClans(1);
    const [testerClan, errors] = await service.addTesterToClan(null, clan_ids);

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('player_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if player_id is undefined', async () => {
    const clan_ids = await createClans(1);
    const [testerClan, errors] = await service.addTesterToClan(
      undefined,
      clan_ids,
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('player_id');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if player_id is an empty string', async () => {
    const clan_ids = await createClans(1);
    const [testerClan, errors] = await service.addTesterToClan('', clan_ids);

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('player_id');
    expect(errors[0].value).toBe('');
  });

  it('Should return REQUIRED ServiceError if clan_ids is null', async () => {
    const tester_ids = await createPlayers(1);
    const [testerClan, errors] = await service.addTesterToClan(
      tester_ids[0],
      null,
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('clan_ids');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if clan_ids is undefined', async () => {
    const tester_ids = await createPlayers(1);
    const [testerClan, errors] = await service.addTesterToClan(
      tester_ids[0],
      undefined,
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('clan_ids');
    expect(errors[0].value).toBeNull();
  });

  it('Should return REQUIRED ServiceError if clan_ids is an empty array', async () => {
    const tester_ids = await createPlayers(1);

    const [testerClan, errors] = await service.addTesterToClan(
      tester_ids[0],
      [],
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('clan_ids');
    expect(errors[0].value).toEqual([]);
  });

  it('Should return NOT_FOUND ServiceError if player_id with provided _id does not exists', async () => {
    const nonExisting_id = new ObjectId(getNonExisting_id()).toString();
    const clan_ids = await createClans(1);

    const [testerClan, errors] = await service.addTesterToClan(
      nonExisting_id,
      clan_ids,
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('player_id');
    expect(errors[0].value).toEqual(nonExisting_id);
  });

  it('Should return NOT_FOUND ServiceError if some of the clan_ids not found', async () => {
    const tester_ids = await createPlayers(1);
    const existingClan_ids = await createClans(1);
    const invalidClan_ids = [
      ...existingClan_ids,
      new ObjectId(getNonExisting_id()).toString(),
    ];

    const [testerClan, errors] = await service.addTesterToClan(
      tester_ids[0],
      invalidClan_ids,
    );

    expect(testerClan).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('clan_ids');
    expect(errors[0].value).toEqual(invalidClan_ids);
    expect(errors[0].additional).toEqual(existingClan_ids);
  });

  it('Should not add tester to clan if some of the clan_ids not found', async () => {
    const tester_ids = await createPlayers(1);
    const existingClan_ids = await createClans(1);
    const invalidClan_ids = [
      ...existingClan_ids,
      new ObjectId(getNonExisting_id()).toString(),
    ];

    await service.addTesterToClan(tester_ids[0], invalidClan_ids);

    const clansAfter = await clanModel.find({ _id: { $in: existingClan_ids } });

    for (const clan of clansAfter) expect(clan.playerCount).toBe(0);
  });

  /**
   * Creates a specified amount of players
   *
   * @param amount amount of players to create
   *
   * @returns created players' _ids
   */
  async function createPlayers(amount: number) {
    const createdPlayer_ids: string[] = [];
    for (let i = 0; i < amount; i++) {
      const playerToCreate = playerBuilder
        .setName(`player-${i}`)
        .setUniqueIdentifier(`player-${i}`)
        .setProfileId(new ObjectId())
        .build();
      const playerResp = await playerModel.create(playerToCreate);

      createdPlayer_ids.push(playerResp._id.toString());
    }

    return createdPlayer_ids;
  }

  /**
   * Creates a specified amount of clans
   *
   * @param amount amount of clans to create
   *
   * @returns created clans' _ids
   */
  async function createClans(amount: number) {
    const createdClan_ids: string[] = [];
    for (let i = 0; i < amount; i++) {
      const clanToCreate = clanBuilder
        .setName(`clan-${i}`)
        .setPlayerCount(0)
        .build();
      const clanResp = await clanModel.create(clanToCreate);

      createdClan_ids.push(clanResp._id.toString());
    }

    return createdClan_ids;
  }

  /**
   * Runs the addTesterToClan() method for each player _id asynchronously
   * @param player_ids
   * @param clan_ids
   */
  async function runAddTesterToClanAsync(
    player_ids: string[],
    clan_ids: string[],
  ) {
    const calls = player_ids.map((player_ids) =>
      service.addTesterToClan(player_ids, clan_ids),
    );
    await Promise.all(calls);
  }
});
