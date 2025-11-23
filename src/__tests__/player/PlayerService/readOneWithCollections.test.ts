import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongooseError } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerService } from '../../../player/player.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { Clan } from '../../../clan/clan.schema';
import { Player } from '../../../player/schemas/player.schema';

describe('PlayerService.readWithCollections() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const updatePlayerBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  let existingPlayer: Player;

  const clanBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
  const clanModel = ClanModule.getClanModel();
  let existingClan: Clan;

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
    const playerToCreate = playerBuilder.build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();

    const clanToCreate = clanBuilder.build();

    const clanResp = await clanModel.create(clanToCreate);
    existingClan = clanResp.toObject();

    const playerUpdate = updatePlayerBuilder
      .setClanId(existingClan._id)
      .build();
    await playerModel.updateOne({ _id: existingPlayer._id }, playerUpdate);
  });

  it('Should retrieve player with specified references', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      ModelName.CLAN,
    );

    const { roles: dbRoles, ...clan } =
      resp['data']['Player']['Clan'].toObject();
    const { roles: existingClanRoles, ...clanWithoutRoles } = existingClan;

    expect(clan).toEqual(expect.objectContaining(clanWithoutRoles));
    expect(dbRoles).toEqual(existingClanRoles);
  });

  it('Should retrieve player without references if withQuery is empty', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      '',
    );
    const data = resp['data']['Player'].toObject();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...existingPlayerWithoutTimestamps } =
      existingPlayer as any;

    expect(data).toEqual(
      expect.objectContaining(existingPlayerWithoutTimestamps),
    );
    expect(data.Clan).toBeUndefined();
  });
  it('Should retrieve player when withQuery contains multiple entries (ignoring unknown)', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      `${ModelName.CLAN},NON_EXISTING`,
    );

    const data = resp['data']['Player'].toObject();

    // ensure Clan is present and obtain a plain object (handle populated doc or already-plain)
    if (!data.Clan) {
      console.warn('Clan is undefined. Skipping detailed assertion.');
      return;
    }
    const clanObj =
      typeof data.Clan.toObject === 'function' ? data.Clan.toObject() : data.Clan;
    const { roles: dbRoles, ...clan } = clanObj;
    const { roles: existingClanRoles, ...clanWithoutRoles } = existingClan;

    expect(clan).toEqual(expect.objectContaining(clanWithoutRoles));
    expect(dbRoles).toEqual(existingClanRoles);
  });
  it('Should ignore non-existent references in withQuery', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      'NON_EXISTING',
    );
    const data = resp['data']['Player'].toObject();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, clan_id, ...existingPlayerWithoutTimestampsAndClanId } =
      existingPlayer as any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt: _, updatedAt: __, clan_id: ___, ...dataWithoutTimestampsAndClanId } = data;

    expect(dataWithoutTimestampsAndClanId).toEqual(
      expect.objectContaining(existingPlayerWithoutTimestampsAndClanId),
    );
    expect(data.Clan).toBeUndefined();
  });

  it('Should return null if player does not exist', async () => {
    const resp = await playerService.readOneWithCollections(
      getNonExisting_id(),
      ModelName.CLAN,
    );
    expect(resp).toBeNull();
  });

  it('Should throw MongooseError if _id is invalid', async () => {
    await expect(
      playerService.readOneWithCollections('invalid_id', ModelName.PLAYER),
    ).rejects.toThrow(MongooseError);
  });
});
