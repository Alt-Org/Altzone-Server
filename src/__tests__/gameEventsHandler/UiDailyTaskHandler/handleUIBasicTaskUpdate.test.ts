import ClanBuilderFactory from "../../clan/data/clanBuilderFactory";
import ClanModule from "../../clan/modules/clan.module";
import LoggedUser from "../../test_utils/const/loggedUser";
import PlayerModule from "../../player/modules/player.module";
import UiDailyTaskHandler from "../../../gameEventsHandler/dailyTask/uiDailyTaskHandler";
import DailyTaskBuilderFactory from "../../dailyTasks/data/dailyTaskBuilderFactory";
import DailyTasksModule from "../../dailyTasks/modules/dailyTasks.module";
import GameEventsHandlerModule from "../modules/gameEventsHandler.module";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";
import GameEventsEmitterBuilderFactory from "../../gameEventsEmitter/data/gameEventsEmitterBuilderFactory";
import GameEventBuilder from "../../gameEventsEmitter/data/gameEventsEmitter/GameEventBuilder";
import {uiDailyTasks} from "../../../dailyTasks/uiDailyTasks/uiDailyTasks";
import {UITaskName} from "../../../dailyTasks/enum/uiTaskName.enum";
import {ObjectId} from "mongodb";
import {ServerTaskName} from "../../../dailyTasks/enum/serverTaskName.enum";

describe('UiDailyTaskHandler.updateUIBasicTask() test suite', () => {
    let handler: UiDailyTaskHandler;
    const gameEventBuilder = GameEventsEmitterBuilderFactory.getBuilder('GameEvent') as GameEventBuilder<'dailyTask.updateUIBasicTask'>;

    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();
    const existingClan = clanBuilder.setName('clan1').build();

    const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
    let loggedPlayer = LoggedUser.getPlayer();
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

    it('Should update amountLeft field of the daily task', async () => {
        const initialAmount = 5;
        const completedAmount = 3;

        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(initialAmount).setAmountLeft(initialAmount)
            .setType(UITaskName.PRESS_FAMOUS_CHARACTER)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id,
            amount: completedAmount
        }).build() as any;

        await handler.handleUIBasicTaskUpdate(event);

        const updatedTask = await taskModel.findById(createdTask._id);

        expect(updatedTask.amountLeft).toBe(initialAmount - completedAmount);
    });

    it('Should update amountLeft field of the daily task on one if amount is not specified', async () => {
        const initialAmount = 5;

        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(initialAmount).setAmountLeft(initialAmount)
            .setType(UITaskName.PRESS_FAMOUS_CHARACTER)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id
        }).build() as any;

        await handler.handleUIBasicTaskUpdate(event);

        const updatedTask = await taskModel.findById(createdTask._id);

        expect(updatedTask.amountLeft).toBe(initialAmount - 1);
    });

    it('Should remove the daily task if the task is completed', async () => {
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(1).setAmountLeft(1)
            .setType(UITaskName.PRESS_FAMOUS_CHARACTER)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id,
            amount: 1
        }).build() as any;

        await handler.handleUIBasicTaskUpdate(event);

        const updatedTask = await taskModel.findById(createdTask._id);

        expect(updatedTask).toBeNull();
    });

    it('Should add right amount of points to player\'s clan if the task is completed', async () => {
        const taskType = UITaskName.PRESS_FAMOUS_CHARACTER;
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(1).setAmountLeft(1)
            .setType(taskType)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);
        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id
        }).build() as any;

        const clanBeforeEventHandled = await clanModel.findById(existingClan._id);
        await handler.handleUIBasicTaskUpdate(event);

        const clanAfterEventHandled = await clanModel.findById(existingClan._id);

        const taskData = uiDailyTasks[taskType];

        expect(clanAfterEventHandled.points).toBe(clanBeforeEventHandled.points + taskData.points);
    });

    it('Should add right amount of coins to player\'s clan if the task is completed', async () => {
        const taskType = UITaskName.PRESS_FAMOUS_CHARACTER;
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(1).setAmountLeft(1)
            .setType(taskType)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);
        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id
        }).build() as any;

        const clanBeforeEventHandled = await clanModel.findById(existingClan._id);
        await handler.handleUIBasicTaskUpdate(event);

        const clanAfterEventHandled = await clanModel.findById(existingClan._id);

        const taskData = uiDailyTasks[taskType];

        expect(clanAfterEventHandled.gameCoins).toBe(clanBeforeEventHandled.gameCoins + taskData.coins);
    });

    it('Should throw NOT_FOUND if it could not find task', async () => {
        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: new ObjectId().toString(),
        }).build() as any;

        const throwingCall = async () => handler.handleUIBasicTaskUpdate(event);

        await expect(throwingCall).rejects.toThrow();
    });

    it('Should throw WRONG_ENUM if task has other type than UI task name', async () => {
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id)
            .setAmount(1).setAmountLeft(1)
            .setType(ServerTaskName.WIN_BATTLE)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        const event = gameEventBuilder.setEventName('dailyTask.updateUIBasicTask').setInfo({
            player_id: loggedPlayer._id,
            task_id: createdTask._id
        }).build() as any;

        try {
            await handler.handleUIBasicTaskUpdate(event)
        } catch (e) {
            expect(e).toBeSE_WRONG_ENUM();
        }
    });
});
