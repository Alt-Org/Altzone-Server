import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import LoggedUser from '../../../test_utils/const/loggedUser';
import PlayerModule from '../../../player/modules/player.module';
import DailyTaskBuilderFactory from '../../data/dailyTaskBuilderFactory';
import DailyTasksModule from '../../modules/dailyTasks.module';
import { ObjectId } from 'mongodb';
import UIDailyTasksService from '../../../../dailyTasks/uiDailyTasks/uiDailyTasks.service';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';

describe('UIDailyTasksService.updateTask() test suite', () => {
  let uiDailyTasksService: UIDailyTasksService;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setName('clan1').build();

  const loggedPlayer = LoggedUser.getPlayer();
  const playerModel = PlayerModule.getPlayerModel();

  const taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');
  const taskModel = DailyTasksModule.getDailyTaskModel();

  beforeEach(async () => {
    uiDailyTasksService = await DailyTasksModule.getUiDailyTasksService();

    const clanResp = await clanModel.create(existingClan);
    existingClan._id = clanResp._id;

    await playerModel.findByIdAndUpdate(loggedPlayer._id, {
      clan_id: existingClan._id,
    });
    loggedPlayer.clan_id = existingClan._id;
  });

  it('Should reject client attempts to advance more than one step', async () => {
    const initialAmount = 5;
    const completedAmount = 3;

    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setType(UITaskName.SPOT_A_CULTURAL_REFERENCE)
      .setAmount(initialAmount)
      .setAmountLeft(initialAmount)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
      completedAmount,
    );

    const updatedTask = await taskModel.findById(createdTask._id);

    expect(result).toBeNull();
    expect(errors).toContainSE_VALIDATION();
    expect(updatedTask.amountLeft).toBe(initialAmount);
  });

  it('Should update amountLeft field of the daily task on one if amount is not specified', async () => {
    const initialAmount = 5;

    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(initialAmount)
      .setAmountLeft(initialAmount)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
    );

    const updatedTask = await taskModel.findById(createdTask._id);

    expect(updatedTask.amountLeft).toBe(initialAmount - 1);
  });

  it('Should return updated status if daily task amountLeft field is greater than 0', async () => {
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(5)
      .setAmountLeft(5)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    const [result] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
      1,
    );

    expect(result.status).toBe('advanced');
  });

  it('Should return completed status if daily task amountLeft field became 0', async () => {
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(1)
      .setAmountLeft(1)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    const [result] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
      1,
    );

    expect(result.status).toBe('completed');
  });

  it('Should remove the daily task if the task is completed', async () => {
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(1)
      .setAmountLeft(1)
      .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
      1,
    );

    const updatedTask = await taskModel.findById(createdTask._id);

    expect(updatedTask).toBeNull();
  });

  it('Should should return ServiceError NOT_FOUND if it could not find task', async () => {
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(5)
      .setAmountLeft(5)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    await clanModel.findByIdAndDelete(existingClan._id);

    const [result, errors] = await uiDailyTasksService.updateTask(
      new ObjectId().toString(),
      createdTask._id.toString(),
      1,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return WRONG_ENUM ServiceError if the task type is not a UI task', async () => {
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setType(ServerTaskName.PLAY_A_BATTLE)
      .setAmount(5)
      .setAmountLeft(5)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
      1,
    );
    expect(result).toBeNull();
    expect(errors).toContainSE_WRONG_ENUM();
  });

  it('Should hide isRewarded and default it to false', async () => {
    const createdTask = await taskModel.create(
      taskBuilder
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(2)
        .setAmountLeft(2)
        .build(),
    );

    const normalTask = await taskModel.findById(createdTask._id);
    const internalTask = await taskModel
      .findById(createdTask._id)
      .select('+isRewarded');

    expect(normalTask?.isRewarded).toBeUndefined();
    expect(internalTask?.isRewarded).toBe(false);
    expect(createdTask.toJSON()).not.toHaveProperty('isRewarded');
  });

  it('Should complete a legacy task without isRewarded', async () => {
    const playerBefore = await playerModel.findById(loggedPlayer._id);
    const clanBefore = await clanModel.findById(existingClan._id);
    const taskId = new ObjectId();
    const legacyTask = taskBuilder
      .setId(taskId)
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
      .setAmount(1)
      .setAmountLeft(1)
      .build();
    await taskModel.collection.insertOne({
      ...legacyTask,
      clan_id: new ObjectId(existingClan._id.toString()),
      player_id: new ObjectId(loggedPlayer._id.toString()),
    } as any);

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      taskId.toString(),
    );
    const repeatedResult = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      taskId.toString(),
    );
    const [playerAfter, clanAfter] = await Promise.all([
      playerModel.findById(loggedPlayer._id),
      clanModel.findById(existingClan._id),
    ]);

    expect(errors).toBeNull();
    expect(result?.status).toBe('completed');
    expect(repeatedResult[0]).toBeNull();
    expect(repeatedResult[1]).toContainSE_NOT_FOUND();
    expect(await taskModel.findById(taskId)).toBeNull();
    expect(playerAfter?.points).toBe(playerBefore.points + legacyTask.points);
    expect(clanAfter?.points).toBe(clanBefore.points + legacyTask.points);
    expect(clanAfter?.gameCoins).toBe(clanBefore.gameCoins + legacyTask.coins);
  });

  it('Should allow only one concurrent final progress and reward claim', async () => {
    const playerBefore = await playerModel.findById(loggedPlayer._id);
    const clanBefore = await clanModel.findById(existingClan._id);
    const createdTask = await taskModel.create(
      taskBuilder
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(1)
        .setAmountLeft(1)
        .build(),
    );

    const results = await Promise.all([
      uiDailyTasksService.updateTask(
        loggedPlayer._id,
        createdTask._id.toString(),
      ),
      uiDailyTasksService.updateTask(
        loggedPlayer._id,
        createdTask._id.toString(),
      ),
    ]);

    expect(
      results.filter(([result]) => result?.status === 'completed'),
    ).toHaveLength(1);
    expect(await taskModel.findById(createdTask._id)).toBeNull();
    const [playerAfter, clanAfter] = await Promise.all([
      playerModel.findById(loggedPlayer._id),
      clanModel.findById(existingClan._id),
    ]);
    expect(playerAfter?.points).toBe(playerBefore.points + createdTask.points);
    expect(clanAfter?.points).toBe(clanBefore.points + createdTask.points);
    expect(clanAfter?.gameCoins).toBe(clanBefore.gameCoins + createdTask.coins);
  });

  it('Should not claim or reward a task before its final progress', async () => {
    const playerBefore = await playerModel.findById(loggedPlayer._id);
    const clanBefore = await clanModel.findById(existingClan._id);
    const taskId = new ObjectId();
    const createdTask = await taskModel.create(
      taskBuilder
        .setId(taskId)
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(2)
        .setAmountLeft(2)
        .setPoints(10)
        .setCoins(5)
        .build(),
    );

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
    );
    const [playerAfter, clanAfter, taskAfter] = await Promise.all([
      playerModel.findById(loggedPlayer._id),
      clanModel.findById(existingClan._id),
      taskModel.findById(createdTask._id).select('+isRewarded'),
    ]);

    expect(errors).toBeNull();
    expect(result?.status).toBe('advanced');
    expect(taskAfter?.amountLeft).toBe(1);
    expect(taskAfter?.isRewarded).toBe(false);
    expect(playerAfter?.points).toBe(playerBefore.points);
    expect(clanAfter?.points).toBe(clanBefore.points);
    expect(clanAfter?.gameCoins).toBe(clanBefore.gameCoins);
  });

  it('Should not progress a task owned by another player', async () => {
    const createdTask = await taskModel.create(
      taskBuilder
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(2)
        .setAmountLeft(2)
        .build(),
    );

    const [result, errors] = await uiDailyTasksService.updateTask(
      new ObjectId().toString(),
      createdTask._id.toString(),
    );
    const taskAfter = await taskModel.findById(createdTask._id);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(taskAfter?.amountLeft).toBe(2);
  });

  it('Should not apply a stale request to a new task instance', async () => {
    const oldTaskId = new ObjectId();
    const oldTask = await taskModel.create(
      taskBuilder
        .setId(oldTaskId)
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(1)
        .setAmountLeft(1)
        .build(),
    );
    await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      oldTask._id.toString(),
    );

    const newTaskId = new ObjectId();
    const newTask = await taskModel.create(
      taskBuilder
        .setId(newTaskId)
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.SPOT_A_CULTURAL_REFERENCE)
        .setAmount(2)
        .setAmountLeft(2)
        .build(),
    );
    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      oldTask._id.toString(),
    );
    const taskAfter = await taskModel.findById(newTask._id);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(taskAfter?.amountLeft).toBe(2);
  });

  it('Should commit task completion and player and clan rewards together', async () => {
    const playerBefore = await playerModel.findById(loggedPlayer._id);
    const clanBefore = await clanModel.findById(existingClan._id);
    const createdTask = await taskModel.create(
      taskBuilder
        .setClanId(existingClan._id)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(1)
        .setAmountLeft(1)
        .setPoints(10)
        .setCoins(5)
        .build(),
    );

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
    );
    const [playerAfter, clanAfter, taskAfter] = await Promise.all([
      playerModel.findById(loggedPlayer._id),
      clanModel.findById(existingClan._id),
      taskModel.findById(createdTask._id),
    ]);

    expect(errors).toBeNull();
    expect(result?.status).toBe('completed');
    expect(taskAfter).toBeNull();
    expect(playerAfter?.points).toBe(playerBefore.points + 10);
    expect(clanAfter?.points).toBe(clanBefore.points + 10);
    expect(clanAfter?.gameCoins).toBe(clanBefore.gameCoins + 5);
  });

  it('Should roll back completion, balances and notifications and allow retry', async () => {
    const missingClanId = new ObjectId();
    const playerBefore = await playerModel.findById(loggedPlayer._id);
    const notifyProgress = jest.spyOn(
      (uiDailyTasksService as any).progressService,
      'notifyProgress',
    );
    const createdTask = await taskModel.create(
      taskBuilder
        .setClanId(missingClanId)
        .setPlayerId(loggedPlayer._id)
        .setType(UITaskName.COMPARE_DEFENCE_SOLDIERS)
        .setAmount(1)
        .setAmountLeft(1)
        .setPoints(10)
        .setCoins(5)
        .build(),
    );

    const [result, errors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
    );
    const [playerAfter, taskAfter] = await Promise.all([
      playerModel.findById(loggedPlayer._id),
      taskModel.findById(createdTask._id).select('+isRewarded'),
    ]);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(playerAfter?.points).toBe(playerBefore.points);
    expect(taskAfter?.amountLeft).toBe(1);
    expect(taskAfter?.isRewarded).toBe(false);
    expect(notifyProgress).not.toHaveBeenCalled();

    const retryClanSuffix = missingClanId.toString().slice(-8);
    const retryClan = ClanBuilderFactory.getBuilder('Clan')
      .setId(missingClanId.toString())
      .setName(`retry-${retryClanSuffix}`)
      .setTag(`retry-${retryClanSuffix}`)
      .build();
    await clanModel.create(retryClan);

    const [retryResult, retryErrors] = await uiDailyTasksService.updateTask(
      loggedPlayer._id,
      createdTask._id.toString(),
    );
    const [playerAfterRetry, clanAfterRetry, taskAfterRetry] =
      await Promise.all([
        playerModel.findById(loggedPlayer._id),
        clanModel.findById(missingClanId),
        taskModel.findById(createdTask._id),
      ]);

    expect(retryErrors).toBeNull();
    expect(retryResult?.status).toBe('completed');
    expect(taskAfterRetry).toBeNull();
    expect(playerAfterRetry?.points).toBe(playerBefore.points + 10);
    expect(clanAfterRetry?.points).toBe(10);
    expect(clanAfterRetry?.gameCoins).toBe(5);
    expect(notifyProgress).toHaveBeenCalledTimes(1);
    notifyProgress.mockRestore();
  });
});
