import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { PlayerService } from '../../../player/player.service';

describe('PlayerService.readOne() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const playerToCreate = playerBuilder.build();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
  });

  it('Should find existing player from DB', async () => {
    const playerResp = await playerModel.create(playerToCreate);

    const [result, errors] = await playerService.readOne({
      filter: { _id: playerResp._id }
    });

    expect(errors).toBeNull();
    expect(result._id.toString()).toBe(playerResp._id.toString());
  });

  it('Should return null for non-existing player', async () => {
    const [result, errors] = await playerService.readOne({
      filter: { _id: getNonExisting_id() }
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
