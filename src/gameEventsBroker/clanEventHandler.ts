import { Injectable } from "@nestjs/common";
import { DailyTasksService } from "../dailyTasks/dailyTasks.service";
import { ClanRewarder } from "../rewarder/clanRewarder/clanRewarder.service";
import { PlayerRewarder } from "../rewarder/playerRewarder/playerRewarder.service";
import ServiceError from "../common/service/basicService/ServiceError";
import { DailyTaskDto } from "../dailyTasks/dto/dailyTask.dto";

@Injectable()
export class ClanEventHandler {
	constructor(
		private readonly dailyTasks: DailyTasksService,
		private readonly clanRewarder: ClanRewarder,
		private readonly playerRewarder: PlayerRewarder,
	) {}

	async handlePlayerTask(player_id: string) {
		const taskUpdate = await this.dailyTasks.updateTask(player_id);
		return this.handleClanAndPlayerReward(player_id, taskUpdate);
	}

	private async handleClanAndPlayerReward(
		player_id: string,
		task: DailyTaskDto
	): Promise<[boolean, ServiceError[]]> {
		if (task.amountLeft !== 0) return [true, null];
		await this.clanRewarder.rewardClanForPlayerTask(
			task.clanId,
			task.points,
			task.coins
		);
		await this.playerRewarder.rewardForPlayerTask(player_id, task.points);

		return [true, null];
	}
}
