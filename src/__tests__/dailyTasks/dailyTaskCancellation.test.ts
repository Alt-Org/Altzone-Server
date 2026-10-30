import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import DailyTasksCommonModule from './modules/dailyTasksCommon.module';
import DailyTaskBuilderFactory from './data/dailyTaskBuilderFactory';
import PlayerModule from '../player/modules/player.module';
import LoggedUser from '../test_utils/const/loggedUser';
import { ObjectId } from 'mongodb';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

describe('Daily task cancellation penalties', () => {
  let dailyTasksService: DailyTasksService;
  const playerModel = PlayerModule.getPlayerModel();
  const taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');

  beforeEach(async () => {
    const module = await DailyTasksCommonModule.getModule();
    dailyTasksService = module.get(DailyTasksService);
  });

  async function createReservedTask(options?: {
    clanId?: string;
    playerId?: string;
    amount?: number;
    amountLeft?: number;
    progress?: object;
  }) {
    return dailyTasksService.model.create(
      taskBuilder
        .setClanId(options?.clanId ?? new ObjectId().toString())
        .setPlayerId(
          options && 'playerId' in options
            ? options.playerId
            : LoggedUser.getPlayer()._id,
        )
        .setAmount(options?.amount ?? 5)
        .setAmountLeft(options?.amountLeft ?? 2)
        .build(),
    );
  }

  it('unreserves a task as fresh and deducts the cancellation penalty', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const task = await createReservedTask({
      playerId,
      amount: 5,
      amountLeft: 2,
    });
    await dailyTasksService.model.updateOne(
      { _id: task._id },
      { $set: { progress: { key: 'partial-progress', steps: [1] } } },
    );

    const [result, errors] = await dailyTasksService.unreserveTask(playerId);

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 5,
    });
    expect(
      await dailyTasksService.model.findById(task._id).lean(),
    ).toMatchObject({
      player_id: null,
      startedAt: null,
      amount: 5,
      amountLeft: 5,
      progress: {},
    });
  });

  it('clamps cancellation points at zero', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 5 } });
    await createReservedTask({ playerId });

    const [, errors] = await dailyTasksService.unreserveTask(playerId);

    expect(errors).toBeNull();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 0,
    });
  });

  it('deducts once and resets the old task when switching to a new task', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    const clanId = new ObjectId().toString();
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const oldTask = await createReservedTask({
      clanId,
      playerId,
      amount: 5,
      amountLeft: 2,
    });
    await dailyTasksService.model.updateOne(
      { _id: oldTask._id },
      { $set: { progress: { key: 'partial-progress', steps: [1] } } },
    );
    const newTask = await createReservedTask({ clanId, playerId: null });

    const [, errors] = await dailyTasksService.reserveTask(
      playerId,
      newTask._id.toString(),
      clanId,
    );

    expect(errors).toBeNull();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 5,
    });
    expect(
      await dailyTasksService.model.findById(oldTask._id).lean(),
    ).toMatchObject({
      player_id: null,
      amountLeft: 5,
      progress: {},
    });
    expect(
      await dailyTasksService.model.findById(newTask._id).lean(),
    ).toMatchObject({
      player_id: new ObjectId(playerId),
    });
  });

  it('replaces an owned task and deducts the cancellation penalty', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    const clanId = new ObjectId().toString();
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const task = await createReservedTask({ clanId, playerId });

    const [result, errors] = await dailyTasksService.relinquishTaskById(
      task._id.toString(),
      clanId,
      playerId,
    );

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 5,
    });
    expect(
      await dailyTasksService.model.findById(task._id).lean(),
    ).toMatchObject({
      player_id: null,
      startedAt: null,
      progress: {},
    });
  });

  it('does not deduct points when the caller does not own the task', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    const clanId = new ObjectId().toString();
    const otherPlayerId = new ObjectId().toString();
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const task = await createReservedTask({ clanId, playerId: otherPlayerId });

    const [result, errors] = await dailyTasksService.relinquishTaskById(
      task._id.toString(),
      clanId,
      playerId,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 15,
    });
    expect(
      await dailyTasksService.model.findById(task._id).lean(),
    ).toMatchObject({
      player_id: new ObjectId(otherPlayerId),
    });
  });

  it('does not deduct points for a repeated unreserve request', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    await createReservedTask({ playerId });

    const [, firstErrors] = await dailyTasksService.unreserveTask(playerId);
    const [secondResult, secondErrors] =
      await dailyTasksService.unreserveTask(playerId);

    expect(firstErrors).toBeNull();
    expect(secondResult).toBeNull();
    expect(secondErrors).toContainSE_NOT_FOUND();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 5,
    });
  });

  it('deducts points only once for concurrent unreserve requests', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    await createReservedTask({ playerId });

    const results = await Promise.all([
      dailyTasksService.unreserveTask(playerId),
      dailyTasksService.unreserveTask(playerId),
    ]);

    expect(results.filter(([, errors]) => !errors)).toHaveLength(1);
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 5,
    });
  });

  it('does not charge a cancellation penalty when replacing a completed task', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    const clanId = new ObjectId().toString();
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const task = await createReservedTask({ clanId, playerId });

    const [, errors] = await dailyTasksService.deleteTask(
      task._id.toString(),
      clanId,
      playerId,
    );

    expect(errors).toBeNull();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 15,
    });
  });

  it('rolls back the task reset when point deduction fails', async () => {
    const playerId = LoggedUser.getPlayer()._id;
    await playerModel.updateOne({ _id: playerId }, { $set: { points: 15 } });
    const task = await createReservedTask({
      playerId,
      amount: 5,
      amountLeft: 2,
    });
    await dailyTasksService.model.updateOne(
      { _id: task._id },
      { $set: { progress: { key: 'partial-progress', steps: [1] } } },
    );
    jest
      .spyOn((dailyTasksService as any).playerRewarder, 'deductPlayerPoints')
      .mockResolvedValue([
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Point deduction failed',
          }),
        ],
      ]);

    const [result, errors] = await dailyTasksService.unreserveTask(playerId);

    expect(result).toBeNull();
    expect(errors).toContainSE_UNEXPECTED();
    expect(await playerModel.findById(playerId).lean()).toMatchObject({
      points: 15,
    });
    expect(
      await dailyTasksService.model.findById(task._id).lean(),
    ).toMatchObject({
      player_id: new ObjectId(playerId),
      amountLeft: 2,
      progress: { key: 'partial-progress', steps: [1] },
    });
  });
});
