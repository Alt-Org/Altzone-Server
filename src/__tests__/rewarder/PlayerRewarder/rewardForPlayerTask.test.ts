import RewarderModule from '../modules/clanRewarder.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { MongooseError } from 'mongoose';

describe('PlayerRewarder.rewardForPlayerTask() test suite', () => {
  let rewarder: PlayerRewarder;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder.setPoints(0).build();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    rewarder = await RewarderModule.getPlayerRewarder();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
  });

  it('Should return true and no errors if input is valid', async () => {
    const [isSuccess, errors] = await rewarder.rewardForPlayerTask(
      existingPlayer._id,
      10,
    );

    expect(errors).toBeNull();
    expect(isSuccess).toBeTruthy();
  });

  it('Should update points amount of specified player', async () => {
    const pointsToAdd = 10;
    const playerBefore = await playerModel.findById(existingPlayer._id);

    await rewarder.rewardForPlayerTask(existingPlayer._id, pointsToAdd);

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points + pointsToAdd);
  });

  it('Should not update points amount if the specified amount is a negative number and return LESS_THAN_MIN ServiceError', async () => {
    const pointsToAdd = -10;
    const playerBefore = await playerModel.findById(existingPlayer._id);

    const [isSuccess, errors] = await rewarder.rewardForPlayerTask(
      existingPlayer._id,
      pointsToAdd,
    );

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_LESS_THAN_MIN();
    expect(errors[0].field).toBe('points');
    expect(errors[0].value).toBe(pointsToAdd);
  });

  it('Should throw MongooseError if the player does not exists', async () => {
    try {
      await rewarder.rewardForPlayerTask(getNonExisting_id(), 10);
    } catch (e) {
      expect(e).toBeInstanceOf(MongooseError);
    }
  });
});
