import {Injectable} from "@nestjs/common";
import {DailyTasksService} from "../dailyTasks/dailyTasks.service";
import {ClanRewarder} from "../rewarder/clanRewarder/clanRewarder.service";
import {PlayerRewarder} from "../rewarder/playerRewarder/playerRewarder.service";
import ServiceError from "../common/service/basicService/ServiceError";
import {DailyTaskDto} from "../dailyTasks/dto/dailyTask.dto";
import {OnGameEvent} from "../gameEventsEmitter/onGameEvent";
import UIDailyTasksService from "../dailyTasks/uiDailyTasks/uiDailyTasks.service";
import {GameEventPayload} from "../gameEventsEmitter/gameEvent";

@Injectable()
export class ClanEventHandler {
    constructor(
        private readonly tasksService: DailyTasksService,
        private readonly uiTasksService: UIDailyTasksService,
        private readonly clanRewarder: ClanRewarder,
        private readonly playerRewarder: PlayerRewarder,
    ) {
    }

    async handlePlayerTask(player_id: string) {
        const taskUpdate = await this.tasksService.updateTask(player_id);
        return this.handleClanAndPlayerReward(player_id, taskUpdate);
    }

    /**
     * Handles side effects on new clan creation. These side effects are:
     *
     * - Creation of daily tasks for the clan
     *
     * @param event
     */
    @OnGameEvent('clan.create', {async: true})
    async handleClanCreation(event: GameEventPayload<'clan.create'>) {
        const clan_idStr = event.info.clan_id.toString();
        const [uiDailyTasks, errors] = this.uiTasksService.getUITasksForClan(clan_idStr);

        if (errors)
            throw errors;

        const [serverTasks] = this.tasksService.generateServerTasksForNewClan(clan_idStr);
        await this.tasksService.createMany([...serverTasks, ...uiDailyTasks]);
    }

    private async handleClanAndPlayerReward(
        player_id: string,
        task: DailyTaskDto
    ): Promise<[boolean, ServiceError[]]> {
        if (task.amountLeft !== 0) return [true, null];
        await this.clanRewarder.rewardClanForPlayerTask(
            task.clan_id,
            task.points,
            task.coins
        );
        await this.playerRewarder.rewardForPlayerTask(player_id, task.points);

        return [true, null];
    }
}
