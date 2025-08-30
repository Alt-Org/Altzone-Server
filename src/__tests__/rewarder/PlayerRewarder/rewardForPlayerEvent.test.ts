import RewarderModule from '../modules/clanRewarder.module';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { Player } from '../../../player/schemas/player.schema';

describe('PlayerRewarder.rewardForPlayerEvent() test suite', () => {
  let rewarder: PlayerRewarder;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  let existingPlayer: Player;
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    await  playerModel.deleteMany({});
    rewarder = await RewarderModule.getPlayerRewarder();
    existingPlayer = playerBuilder.setPoints(0).setBattlePoints(30).build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
  });

  it('Should update players battles points if event type is battle_won', async () => {
    const event = 'battle_won' as any;
    const playerBefore = await playerModel.findById(existingPlayer._id);

    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      event,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(playerAfter.battlePoints).toBe(130);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  

  it('Should update players battles points if event type is battle_lose and has enough battle points', async () => {
    playerModel.deleteMany({});
    const event = 'battle_lose' as any;

    const playerBefore = await playerModel.findById(existingPlayer._id);

    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      event,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(playerAfter.battlePoints).toBe(10);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should update players battles points if event type is battle_lose, but battle points could not be negative', async () => {
    const event = 'battle_lose' as any;
    await playerModel.deleteMany({});
    existingPlayer = playerBuilder.setName('loserPlayer').setUniqueIdentifier('loserIdentifier').setPoints(0).setBattlePoints(10).build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;

    const playerBefore = await playerModel.findById(existingPlayer._id);

    
    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      event,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(playerAfter.battlePoints).toBe(0);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should not update players battles points if event type is battle_lose and battle points is 0', async () => {
    await playerModel.deleteMany({});
    const event = 'battle_lose' as any;
    playerModel.deleteMany({});
    existingPlayer = playerBuilder.setName('loserPlayer').setUniqueIdentifier('loserIdentifier').setPoints(0)
    .setBattlePoints(0).build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;

    const playerBefore = await playerModel.findById(existingPlayer._id);

    
    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      event,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(playerAfter.battlePoints).toBe(0);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should not update points amount if the specified event does not exists and return WRONG_ENUM ServiceError', async () => {
    const event = 'Non-existing-event' as any;
    const playerBefore = await playerModel.findById(existingPlayer._id);

    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      event,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_WRONG_ENUM();
    expect(errors[0].field).toBe('playerEvent');
    expect(errors[0].value).toBe(event);
  });
});
