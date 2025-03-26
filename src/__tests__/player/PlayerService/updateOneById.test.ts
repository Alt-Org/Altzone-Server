import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { MongoServerError } from 'mongodb';
import { PlayerService } from '../../../player/player.service';
import PlayerBuilderFactory from '../data/playerBuilderFactory';
import { Player } from '../../../player/schemas/player.schema';
import PlayerModule from '../modules/player.module';

describe('PlayerService.updateOneById() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const updatePlayerBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  let existingPlayer: Player;

  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
    const playerToCreate = playerBuilder.build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();
  });

  it('Should successfully update an existing player', async () => {
    const updateData = { _id: existingPlayer._id, name: 'newName' };
    const resp = await playerService.updateOneById(updateData);

    expect(resp).toBeTruthy();

    const updatedPlayer = await playerModel.findById(existingPlayer._id);
    expect(updatedPlayer.name).toBe(updateData.name);
  });

  //TODO: sometimes it fails and does not throw any error
  it('Should throw error if the name already exists', async () => {
    const notUniqueName = 'anotherName';
    const anotherPlayerData = playerBuilder
      .setName(notUniqueName)
      .setUniqueIdentifier(notUniqueName)
      .build();
    await playerModel.create(anotherPlayerData);

    const updateData = updatePlayerBuilder
      .setId(existingPlayer._id)
      .setName(notUniqueName)
      .build();

    await expect(playerService.updateOneById(updateData)).rejects.toThrow(
      MongoServerError,
    );
  });

  it('Should not throw error if the player is not found', async () => {
    const nonExistingId = getNonExisting_id();
    const updateData = { _id: nonExistingId, name: 'non-existing' };

    const result = await playerService.updateOneById(updateData);

    expect(result).toBeTruthy();
  });
});
