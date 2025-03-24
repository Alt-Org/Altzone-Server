import { PlayerService } from '../../../player/player.service';
import PlayerBuilderFactory from '../data/playerBuilderFactory';
import PlayerModule from '../modules/player.module';

describe('PlayerService.deleteByCondition() test suite', () => {
  let playerService: PlayerService;
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const name1 = 'player1';
  const name2 = 'player2';

  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    await playerModel.deleteMany({});
    playerService = await PlayerModule.getPlayerService();

    const playerToCreate1 = playerBuilder
      .setName(name1)
      .setUniqueIdentifier(name1)
      .build();
    await playerModel.create(playerToCreate1);

    const playerToCreate2 = playerBuilder
      .setName(name2)
      .setUniqueIdentifier(name2)
      .build();
    await playerModel.create(playerToCreate2);
  });

  it('Should delete a single player based on condition if options.isOne is true', async () => {
    const condition = { name: name1 };
    const result = await playerService.deleteByCondition(condition, {
      isOne: true,
    });

    expect(result['deletedCount']).toBe(1);

    const deletedProfile = await playerModel.findOne({ name: name1 });
    expect(deletedProfile).toBeNull();
  });

  it('Should not delete player, which does not match the condition', async () => {
    const condition = { name: name1 };
    await playerService.deleteByCondition(condition, { isOne: true });

    const player = await playerModel.findOne({ name: name2 });
    expect(player).not.toBeNull();
    expect(player.name).toBe(name2);
  });

  it('Should delete multiple players based on condition if options.isOne is false or undefined', async () => {
    const condition = { name: { $in: [name1, name2] } };
    const result = await playerService.deleteByCondition(condition);

    expect(result['deletedCount']).toBe(2);

    const deletedPlayers = await playerModel.find({
      name: { $in: [name1, name2] },
    });
    expect(deletedPlayers.length).toBe(0);
  });

  it('Should return null if no players match the condition for single deletion', async () => {
    const condition = { name: 'nonExistentPlayer' };
    const result = await playerService.deleteByCondition(condition, {
      isOne: true,
    });

    expect(result).toBeNull();
  });

  it('Should return null if no players match the condition for multiple deletion', async () => {
    const condition = { username: 'nonExistentPlayer' };
    const result = await playerService.deleteByCondition(condition);

    expect(result).toBeNull();
  });
});
