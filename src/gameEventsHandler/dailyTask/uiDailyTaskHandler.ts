import {OnGameEvent} from "../../gameEventsEmitter/onGameEvent";
import {GameEventPayload} from "../../gameEventsEmitter/gameEvent";
import {Injectable} from "@nestjs/common";
import UIDailyTasksService from "../../dailyTasks/uiDailyTasks/uiDailyTasks.service";
import BasicService from "../../common/service/basicService/BasicService";
import {InjectModel} from "@nestjs/mongoose";
import {DailyTask} from "../../dailyTasks/dailyTasks.schema";
import {Model} from "mongoose";
import DailyTaskNotifier from "./DailyTaskNotifier";
import {uiDailyTasks} from "../../dailyTasks/uiDailyTasks/uiDailyTasks";
import ServiceError from "../../common/service/basicService/ServiceError";
import {SEReason} from "../../common/service/basicService/SEReason";
import {ClanRewarder} from "../../rewarder/clanRewarder/clanRewarder.service";

/**
 * Handles all events regarding UI daily tasks
 */
@Injectable()
export default class UiDailyTaskHandler {

    constructor(
        private readonly taskService: UIDailyTasksService,
        private readonly notifier: DailyTaskNotifier,
        @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
        private readonly clanRewarder: ClanRewarder,
    ) {
        this.basicService = new BasicService(model);
    }

    private readonly basicService: BasicService;

    /**
     * Handles updates of a basic UI daily task:
     * - Updates amountLeft field of a task
     * - Removes dailyTask if it is completed (amountLeft=0)
     * - Adds points and coins to player's clan if the task is completed
     * - Sends a MQTT notification about the updated / completed task
     *
     * @param payload required task data to handle the event
     *
     * @throws {ServiceError} NOT_FOUND if the task could not be found or WRONG_ENUM if the task has no UI task name
     */
    @OnGameEvent('dailyTask.updateUIBasicTask', {async: true})
    async handleUIBasicTaskUpdate(payload: GameEventPayload<'dailyTask.updateUIBasicTask'>) {
        const {info} = payload;

        const task_idStr = info.task_id.toString();
        const player_idStr = info.player_id.toString();

        const [[status, task], errors] = await this.taskService.updateTask(task_idStr, player_idStr, info.amount ?? 1);

        if (errors)
            throw new ServiceError({
                ...errors[0], message: 'Failed to update UI daily task'
            });

        if (status === 'updated') {
            this.notifier.taskUpdated(player_idStr, task);
            return;
        }

        this.notifier.taskCompleted(player_idStr, task);
        const [, deletionErrors] = await this.basicService.deleteOneById(task_idStr);

        if (deletionErrors)
            throw new ServiceError({
                ...deletionErrors[0], message: 'Failed to delete completed UI daily task'
            });

        const taskData = uiDailyTasks[task.type];
        if (!taskData)
            throw new ServiceError({
                reason: SEReason.WRONG_ENUM, field: 'task.type', value: task.type,
                message: `UI daily task type ${task.type} is not found`
            });

        await this.clanRewarder.rewardClanForPlayerTask(task.clan_id.toString(), taskData.points, taskData.coins);
    }
}
