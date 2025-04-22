import { PlayerDto } from '../../../player/dto/player.dto';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { PlayerService } from '../../../player/player.service';

describe('PlayerService.updatePlayerById() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const updatePlayerBuilder =
    PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const playerModel = PlayerModule.getPlayerModel();
  let existingPlayer: PlayerDto;

  beforeEach(async () => {
    playerService = await PlayerModule.getPlayerService();
    const playerToCreate = playerBuilder.build();
    const playerResp = await playerModel.create(playerToCreate);
    existingPlayer = playerResp.toObject();
  });

  it('Should update player in the DB and return true if the input is valid', async () => {
    const updatedName = 'updatedClan';
    const updateData = updatePlayerBuilder.setName(updatedName).build();

    const [wasUpdated, errors] = await playerService.updatePlayerById(
      existingPlayer._id,
      updateData,
    );

    expect(errors).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const updatedPlayer = await playerModel.findById(existingPlayer._id);
    expect(updatedPlayer.name).toBe(updatedName);
  });

  it('Should return ServiceError NOT_FOUND if player with the provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const updateData = updatePlayerBuilder.setName('updatedName').build();

    const [wasUpdated, errors] = await playerService.updatePlayerById(
      nonExisting_id,
      updateData,
    );

    expect(wasUpdated).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not throw any error if _id or input is null or undefined', async () => {
    const nullInput = async () =>
      await playerService.updatePlayerById(null, null);
    const undefinedInput = async () =>
      await playerService.updatePlayerById(undefined, undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
