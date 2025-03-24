import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import LoggedUser from '../../../test_utils/const/loggedUser';
import PlayerModule from '../../../player/modules/player.module';
import DailyTaskBuilderFactory from '../../data/dailyTaskBuilderFactory';
import DailyTasksModule from '../../modules/dailyTasks.module';
import { ObjectId } from 'mongodb';
import UIDailyTasksService from '../../../../dailyTasks/uiDailyTasks/uiDailyTasks.service';

describe('UIDailyTasksService.updateTask() test suite', () => {
  let uiDailyTasksService: UIDailyTasksService;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setName('clan1').build();

  const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const loggedPlayer = LoggedUser.getPlayer();
  const playerModel = PlayerModule.getPlayerModel();

  const taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');
  const taskModel = DailyTasksModule.getDailyTaskModel();

  beforeEach(async () => {
    uiDailyTasksService = await DailyTasksModule.getUiDailyTasksService();

    const clanResp = await clanModel.create(existingClan);
    existingClan._id = clanResp._id;

    const playerUpdate = playerBuilder.setClanId(existingClan._id).build();
    await playerModel.findByIdAndUpdate(loggedPlayer._id, playerUpdate);
    loggedPlayer.clan_id = existingClan._id;
  });

  it('Should update amountLeft field of the daily task', async () => {
    const initialAmount = 5;
    const completedAmount = 3;

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
      createdTask._id,
      loggedPlayer._id,
      completedAmount,
    );

    const updatedTask = await taskModel.findById(createdTask._id);

    expect(updatedTask.amountLeft).toBe(initialAmount - completedAmount);
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

    await uiDailyTasksService.updateTask(createdTask._id, loggedPlayer._id);

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

    const [[status]] = await uiDailyTasksService.updateTask(
      createdTask._id,
      loggedPlayer._id,
      1,
    );

    expect(status).toBe('updated');
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

    const [[status]] = await uiDailyTasksService.updateTask(
      createdTask._id,
      loggedPlayer._id,
      1,
    );

    expect(status).toBe('completed');
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
    await taskModel.create(dailyTaskToCreate);

    await clanModel.findByIdAndDelete(existingClan._id);

    const [result, errors] = await uiDailyTasksService.updateTask(
      new ObjectId().toString(),
      loggedPlayer._id,
      1,
    );

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
