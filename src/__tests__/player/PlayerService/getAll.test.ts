import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { PlayerService } from '../../../player/player.service';
import { Clan } from '../../../clan/clan.schema';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { Player } from '../../../player/schemas/player.schema';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { PlayerDto } from '../../../player/dto/player.dto';
import { PlayerObject } from 'src/common/type/playerObject.type';
import { ClanDto } from 'src/clan/dto/clan.dto';

describe('PlayerService.getAll() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const updatePlayerBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  const playerName1 = 'player1';
  const playerName2 = 'player2';
  let player1: Player;
  let player2: Player;

  const clanBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
  const clanModel = ClanModule.getClanModel();
  let existingClan: Clan;

  beforeEach(async () => {
    await playerModel.deleteMany({});
    playerService = await PlayerModule.getPlayerService();
    const playerToCreate1 = playerBuilder
      .setName(playerName1)
      .setUniqueIdentifier(playerName1)
      .build();
    const playerResp1 = await playerModel.create(playerToCreate1);
    player1 = playerResp1.toObject();

    const playerToCreate2 = playerBuilder
      .setName(playerName2)
      .setUniqueIdentifier(playerName2)
      .build();
    const playerResp2 = await playerModel.create(playerToCreate2);
    player2 = playerResp2.toObject();

    const clanToCreate = clanBuilder.build();
    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();

    const playerUpdate = updatePlayerBuilder
      .setClanId(existingClan._id)
      .build();
    await playerModel.updateMany(
      {
        $or: [{ name: playerName1 }, { name: playerName2 }],
      },
      playerUpdate,
    );

    player1.clan_id = existingClan._id;
    player2.clan_id = existingClan._id;
  });

  it('Should find all existing players in DB', async () => {
    const [players, errors] = await playerService.getAll();

    const returnedPlayers = [];
    for (const player of players)
      returnedPlayers.push((player as any).toObject());

    expect(errors).toBeNull();

    const timestampMatcher = {
      updatedAt: expect.any(Date),
      createdAt: expect.any(Date),
    };

    expect(returnedPlayers).toEqual([
      expect.objectContaining({ ...player1, ...timestampMatcher }),
      expect.objectContaining({ ...player2, ...timestampMatcher }),
    ]);
  });

  it('Should return NOT_FOUND ServiceError for non-existing player', async () => {
    const [players, errors] = await playerService.getAll({
      filter: { name: 'non-existing' },
    });

    expect(players).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return only specified in select option fields', async () => {
    const [players, errors] = await playerService.getAll({
      select: ['_id', 'name'],
    });

    const selectedFields = [
      { _id: player1._id, name: player1.name },
      { _id: player2._id, name: player2.name },
    ];
    const clearedResp = clearDBRespDefaultFields(players);

    expect(errors).toBeNull();
    expect(clearedResp).toEqual(selectedFields);
  });

  it('Should return only 1 player if limit is set to 1', async () => {
    const [players, errors] = await playerService.getAll({ limit: 1 });

    expect(errors).toBeNull();
    expect(players).toHaveLength(1);
  });

  it('Should return desc sorted by name players if requested', async () => {
    const [players, errors] = (await playerService.getAll({
      sort: { name: -1 },
    })) as [PlayerObject[], ServiceError[]];

    expect(errors).toBeNull();
    expect(players[0].name).toBe(player2.name);
    expect(players[1].name).toBe(player1.name);
  });

  it('Should be able to skip first found player in DB if requested', async () => {
    const [players, errors] = (await playerService.getAll({
      skip: 1,
      sort: { name: -1 },
    })) as [PlayerObject[], ServiceError[]];

    expect(errors).toBeNull();
    expect(players).toHaveLength(1);
    expect(players[0].name).toBe(player1.name);
  });

  it("Should include get players' clan if requested", async () => {
    const [players, errors] = (await playerService.getAll({
      includeRefs: [ModelName.CLAN],
    })) as [PlayerObject[], ServiceError[]];

    const clearedResp = clearDBRespDefaultFields(players[0]);
    const { roles: dbRoles, ...clan } = clearedResp.Clan;
    const { roles: existingClanRoles, ...clanWithoutRoles } =
      clearDBRespDefaultFields(existingClan);
    expect(errors).toBeNull();

    expect(clan).toEqual(expect.objectContaining(clanWithoutRoles));
    expect(dbRoles).toEqual(existingClanRoles);
    expect(errors).toBeNull();
  });

  it('Should ignore non-existing references requested', async () => {
    const nonExistingRef = 'Non-existingRef' as ModelName;
    const [players, errors] = await playerService.getAll({
      includeRefs: [nonExistingRef],
    });

    expect(errors).toBeNull();
    expect(players[0][nonExistingRef]).toBeUndefined();
    expect(players[1][nonExistingRef]).toBeUndefined();
  });
});
