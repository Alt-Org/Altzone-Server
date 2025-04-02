import RewarderModule from '../modules/clanRewarder.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { MongooseError } from 'mongoose';
import { PlayerEvent } from '../../../rewarder/playerRewarder/enum/PlayerEvent.enum';
import { points } from '../../../rewarder/playerRewarder/points';

describe('PlayerRewarder.rewardForPlayerEvent() test suite', () => {
  let rewarder: PlayerRewarder;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder.setPoints(0).build();
  const playerModel = PlayerModule.getPlayerModel();
  const messageBuilder = PlayerBuilderFactory.getBuilder('Message');

  beforeEach(async () => {
    rewarder = await RewarderModule.getPlayerRewarder();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
  });

  it('Should return true and no errors if input is valid', async () => {
    const [isSuccess, errors] = await rewarder.rewardForPlayerEvent(
      existingPlayer._id,
      PlayerEvent.BATTLE_PLAYED,
    );

    expect(errors).toBeNull();
    expect(isSuccess).toBeTruthy();
  });

  it('Should update points amount of specified player with right value', async () => {
    const event = PlayerEvent.BATTLE_PLAYED;
    const expectedAddedPoints = points[event];
    const playerBefore = await playerModel.findById(existingPlayer._id);

    await rewarder.rewardForPlayerEvent(existingPlayer._id, event);

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points + expectedAddedPoints);
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

  it('Should not update points amount of specified player if player sent less than 3 messages', async () => {
    const event = PlayerEvent.MESSAGE_SENT;

    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      gameStatistics: {
        messages: [messageBuilder.setCount(1).build()],
      },
    });
    const playerBefore = await playerModel.findById(existingPlayer._id);

    await rewarder.rewardForPlayerEvent(existingPlayer._id, event);

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
  });

  it('Should update points amount of specified player if player sent 3 messages', async () => {
    const event = PlayerEvent.MESSAGE_SENT;
    const expectedAddedPoints = points[event];

    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      gameStatistics: {
        messages: [messageBuilder.setCount(3).build()],
      },
    });
    const playerBefore = await playerModel.findById(existingPlayer._id);

    await rewarder.rewardForPlayerEvent(existingPlayer._id, event);

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points + expectedAddedPoints);
  });

  it('Should not update points amount of specified player if player sent more than 3 messages', async () => {
    const event = PlayerEvent.MESSAGE_SENT;

    await playerModel.findByIdAndUpdate(existingPlayer._id, {
      gameStatistics: {
        messages: [messageBuilder.setCount(4).build()],
      },
    });
    const playerBefore = await playerModel.findById(existingPlayer._id);

    await rewarder.rewardForPlayerEvent(existingPlayer._id, event);

    const playerAfter = await playerModel.findById(existingPlayer._id);
    expect(playerAfter.points).toBe(playerBefore.points);
  });

  it('Should throw MongooseError if the player does not exists', async () => {
    try {
      const event = PlayerEvent.BATTLE_PLAYED;
      await rewarder.rewardForPlayerEvent(getNonExisting_id(), event);
    } catch (e) {
      expect(e).toBeInstanceOf(MongooseError);
    }
  });
});
