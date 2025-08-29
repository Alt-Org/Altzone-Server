import RewarderModule from '../modules/clanRewarder.module';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';

describe('PlayerRewarder.rewardForPlayerEvent() test suite', () => {
  let rewarder: PlayerRewarder;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder.setPoints(0).build();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    rewarder = await RewarderModule.getPlayerRewarder();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
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
