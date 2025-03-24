import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { PlayerDto } from '../../../player/dto/player.dto';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongooseError } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { PlayerService } from '../../../player/player.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { Clan } from '../../../clan/clan.schema';

describe('PlayerService.readWithCollections() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const updatePlayerBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  let existingPlayer: PlayerDto;

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

    const data = resp['data']['Player'];

    expect(data.Clan).toEqual(expect.objectContaining(existingClan));
  });

  it('Should retrieve player without references if withQuery is empty', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      '',
    );
    const data = resp['data']['Player'].toObject();

    expect(data).toEqual(expect.objectContaining(existingPlayer));
    expect(data.Clan).toBeUndefined();
  });

  it('Should ignore non-existent references in withQuery', async () => {
    const resp = await playerService.readOneWithCollections(
      existingPlayer._id,
      'NON_EXISTING',
    );
    const data = resp['data']['Player'].toObject();

    expect(data).toEqual(expect.objectContaining(existingPlayer));
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
