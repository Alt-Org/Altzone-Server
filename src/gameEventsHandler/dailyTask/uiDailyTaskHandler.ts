import {OnGameEvent} from "../../gameEventsEmitter/onGameEvent";
import {GameEventPayload} from "../../gameEventsEmitter/gameEvent";
import {Injectable} from "@nestjs/common";
import DailyTaskNotifier from "./DailyTaskNotifier";
import {ClanRewarder} from "../../rewarder/clanRewarder/clanRewarder.service";

/**
 * Handles all side effects regarding UI daily tasks
 */
@Injectable()
export default class UiDailyTaskHandler {

    constructor(
        private readonly notifier: DailyTaskNotifier,
        private readonly clanRewarder: ClanRewarder,
    ) {
    }

    /**
     * Handles updates of a basic UI daily task:
     * - Updates amountLeft field of a task
     * - Removes dailyTask if it is completed (amountLeft=0)
     * - Adds points and coins to player's clan if the task is completed
     * - Sends a MQTT notification about the updated / completed task
     *
     * @param payload required task data to handle the event
     *
     * @throws {ServiceError} NOT_FOUND if the task clan can not be found
     */
    @OnGameEvent('dailyTask.updateUIBasicTask', {async: true})
    async handleUIBasicTaskUpdate(payload: GameEventPayload<'dailyTask.updateUIBasicTask'>) {
        const {info} = payload;

        const {status, task} = info;
        const player_id = task.player_id.toString();
        const clan_id = task.clan_id.toString();

        if (status === 'updated') {
            this.notifier.taskUpdated(player_id, task);
            return;
        }

        this.notifier.taskCompleted(player_id, task);

        await this.clanRewarder.rewardClanForPlayerTask(clan_id, task.points, task.coins);
    }
}
