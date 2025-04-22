import { PlayerDto } from '../../../player/dto/player.dto';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongooseError } from 'mongoose';
import { PlayerService } from '../../../player/player.service';
import { Clan } from '../../../clan/clan.schema';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { ModelName } from '../../../common/enum/modelName.enum';

describe('PlayerService.readOneById() test suite', () => {
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

  it('Should find existing player from DB', async () => {
    const resp = await playerService.readOneById(existingPlayer._id);

    const data = resp['data']['Player'].toObject();

    expect(data).toEqual(expect.objectContaining(existingPlayer));
  });

  it('Should return null for non-existing player', async () => {
    const resp = await playerService.readOneById(getNonExisting_id());

    expect(resp).toBeNull();
  });

  it('Should throw MongooseError if provided _id is not valid', async () => {
    const invalid_id = 'not-valid';

    await expect(playerService.readOneById(invalid_id)).rejects.toThrow(
      MongooseError,
    );
  });

  it('Should get player collection references if they exists in schema', async () => {
    const resp = await playerService.readOneById(existingPlayer._id, [
      ModelName.CLAN,
    ]);

    const data = resp['data']['Player'].toObject();

    expect(data.Clan).toEqual(expect.objectContaining(existingClan));
  });

  it('Should throw MongooseError if non-existing references requested', async () => {
    const nonExistingReferences: any = ['non-existing'];

    await expect(
      playerService.readOneById(existingPlayer._id, nonExistingReferences),
    ).rejects.toThrow(MongooseError);
  });
});
