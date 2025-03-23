import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";
import ClanModule from "../../../clan/modules/clan.module";
import PlayerBuilderFactory from "../../../player/data/playerBuilderFactory";
import LoggedUser from "../../../test_utils/const/loggedUser";
import PlayerModule from "../../../player/modules/player.module";
import DailyTaskBuilderFactory from "../../data/dailyTaskBuilderFactory";
import DailyTasksModule from "../../modules/dailyTasks.module";
import { ObjectId } from "mongodb";
import UIDailyTasksService from "../../../../dailyTasks/uiDailyTasks/uiDailyTasks.service";
import { UITaskName } from "../../../../dailyTasks/enum/uiTaskName.enum";
import { ServerTaskName } from "../../../../dailyTasks/enum/serverTaskName.enum";
import { SEReason } from "../../../../common/service/basicService/SEReason";

describe('UIDailyTasksService.progressTask() test suite', () => {
    let uiDailyTasksService: UIDailyTasksService;

    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();
    const existingClan = clanBuilder.setName('clan1').build();

    const playerBuilder = PlayerBuilderFactory.getBuilder('UpdatePlayerDto');
    let loggedPlayer = LoggedUser.getPlayer();
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

    it('Should progress the task and update amountLeft', async () => {
        const initialAmount = 5;
        const progressAmount = 2;

        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id).setType(UITaskName.CHANGE_LANGUAGE)
            .setAmount(initialAmount).setAmountLeft(initialAmount)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        await uiDailyTasksService.progressTask(loggedPlayer._id, progressAmount);

        const updatedTask = await taskModel.findById(createdTask._id);

        expect(updatedTask.amountLeft).toBe(initialAmount - progressAmount);
    });

    it('Should complete the task and reward player if amountLeft becomes 0', async () => {
        const initialAmount = 3;
        const progressAmount = 3;

		const playerInitialPoints = loggedPlayer.points;
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id).setType(UITaskName.CHANGE_LANGUAGE)
            .setAmount(initialAmount).setAmountLeft(initialAmount)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        const createdTask = await taskModel.create(dailyTaskToCreate);

        const result = await uiDailyTasksService.progressTask(loggedPlayer._id, progressAmount);

        const updatedTask = await taskModel.findById(createdTask._id);
		const player = await playerModel.findById(loggedPlayer._id);

        expect(result).toBe(true);
        expect(updatedTask).toBeNull(); // Task should be deleted after completion
		expect(player.points).toEqual(playerInitialPoints + dailyTaskToCreate.points);
    });

    it('Should throw an error if the task is not found', async () => {
        const nonExistentPlayerId = new ObjectId().toString();

        await expect(uiDailyTasksService.progressTask(nonExistentPlayerId, 1)).rejects.toEqualSE([SEReason.NOT_FOUND]);
    });

    it('Should throw an error if the task type is not a UI task', async () => {
        const dailyTaskToCreate = taskBuilder
            .setClanId(existingClan._id).setPlayerId(loggedPlayer._id).setType(ServerTaskName.ADD_FRIEND)
            .setAmount(5).setAmountLeft(5)
            .setPlayerId(loggedPlayer._id).setClanId(existingClan._id)
            .build();
        await taskModel.create(dailyTaskToCreate);

        await expect(uiDailyTasksService.progressTask(loggedPlayer._id, 1)).rejects.toEqualSE([SEReason.WRONG_ENUM]);
    });
});