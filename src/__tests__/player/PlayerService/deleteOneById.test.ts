import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { PlayerService } from '../../../player/player.service';
import { Player } from '../../../player/schemas/player.schema';

describe('PlayerService.deleteOneById() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  let existingPlayer: Player;

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
    const playerToCreate = playerBuilder.build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();
  });

  it('Should successfully delete the player', async () => {
    const result = await playerService.deleteOneById(existingPlayer._id);

    expect(result['deletedCount']).toBe(1);
    const deletedPlayer = await playerModel.findById(existingPlayer._id).exec();
    expect(deletedPlayer).toBeNull();
  });

  it('Should return null if player does not exist', async () => {
    const nonExistingId = getNonExisting_id();

    const result = await playerService.deleteOneById(nonExistingId);

    expect(result).toBeNull();
  });

  it('Should not affect player collection if player does not exist', async () => {
    const nonExistingId = getNonExisting_id();

    await playerService.deleteOneById(nonExistingId);

    const player = await playerModel.findById(existingPlayer._id).exec();

    expect(player).not.toBeNull();
    expect(player._id.toString()).toBe(existingPlayer._id.toString());
  });
});
