import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import LoggedUser from '../../test_utils/const/loggedUser';
import PlayerModule from '../../player/modules/player.module';
import UiDailyTaskHandler from '../../../gameEventsHandler/dailyTask/uiDailyTaskHandler';
import DailyTaskBuilderFactory from '../../dailyTasks/data/dailyTaskBuilderFactory';
import DailyTasksModule from '../../dailyTasks/modules/dailyTasks.module';
import GameEventsHandlerModule from '../modules/gameEventsHandler.module';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import GameEventsEmitterBuilderFactory from '../../gameEventsEmitter/data/gameEventsEmitterBuilderFactory';
import GameEventBuilder from '../../gameEventsEmitter/data/gameEventsEmitter/GameEventBuilder';
import { UITaskName } from '../../../dailyTasks/enum/uiTaskName.enum';

describe('UiDailyTaskHandler.updateUIBasicTask() test suite', () => {
  let handler: UiDailyTaskHandler;
  const gameEventBuilder = GameEventsEmitterBuilderFactory.getBuilder(
    'GameEvent',
  ) as GameEventBuilder<'dailyTask.updateUIBasicTask'>;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setName('clan1').build();

  const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
  const loggedPlayer = LoggedUser.getPlayer();
  const playerModel = PlayerModule.getPlayerModel();

  const taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');
  const taskModel = DailyTasksModule.getDailyTaskModel();

  beforeEach(async () => {
    handler = await GameEventsHandlerModule.getUiDailyTaskHandler();

    const clanResp = await clanModel.create(existingClan);
    existingClan._id = clanResp._id;

    const playerUpdate = playerBuilder.setClanId(existingClan._id).build();
    await playerModel.findByIdAndUpdate(loggedPlayer._id, playerUpdate);
    loggedPlayer.clan_id = existingClan._id;
  });

  it("Should add right amount of points to player's clan if the task is completed", async () => {
    const taskType = UITaskName.PRESS_FAMOUS_CHARACTER;
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(1)
      .setAmountLeft(1)
      .setType(taskType)
      .setPoints(10)
      .setCoins(10)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);
    const event = gameEventBuilder
      .setEventName('dailyTask.updateUIBasicTask')
      .setInfo({
        status: 'completed',
        task: createdTask,
      })
      .build() as any;

    const clanBeforeEventHandled = await clanModel.findById(existingClan._id);
    await handler.handleUIBasicTaskUpdate(event);

    const clanAfterEventHandled = await clanModel.findById(existingClan._id);

    expect(clanAfterEventHandled.points).toBe(
      clanBeforeEventHandled.points + createdTask.points,
    );
  });

  it("Should add right amount of coins to player's clan if the task is completed", async () => {
    const taskType = UITaskName.PRESS_FAMOUS_CHARACTER;
    const dailyTaskToCreate = taskBuilder
      .setClanId(existingClan._id)
      .setPlayerId(loggedPlayer._id)
      .setAmount(1)
      .setAmountLeft(1)
      .setType(taskType)
      .setPoints(10)
      .setCoins(10)
      .setPlayerId(loggedPlayer._id)
      .setClanId(existingClan._id)
      .build();
    const createdTask = await taskModel.create(dailyTaskToCreate);
    const event = gameEventBuilder
      .setEventName('dailyTask.updateUIBasicTask')
      .setInfo({
        status: 'completed',
        task: createdTask,
      })
      .build() as any;

    const clanBeforeEventHandled = await clanModel.findById(existingClan._id);
    await handler.handleUIBasicTaskUpdate(event);

    const clanAfterEventHandled = await clanModel.findById(existingClan._id);

    expect(clanAfterEventHandled.gameCoins).toBe(
      clanBeforeEventHandled.gameCoins + createdTask.coins,
    );
  });
});
