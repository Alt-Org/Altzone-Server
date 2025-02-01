import { Injectable } from '@nestjs/common';
import { PlayerTasksService, TaskUpdateResult } from '../dailyTasks/dailyTasks.service';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import { TaskName } from '../dailyTasks/enum/taskName.enum';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { PlayerService } from '../player/player.service';
import { Task } from '../dailyTasks/type/task.type';
import { Reward } from '../rewarder/clanRewarder/points';
import ServiceError from '../common/service/basicService/ServiceError';

@Injectable()
export class ClanEventHandler {
	constructor(
		private readonly playerTasks: PlayerTasksService,
		private readonly clanRewarder: ClanRewarder,
		private readonly playerRewarder: PlayerRewarder,
		private readonly playerService: PlayerService
	){
		
	}

	async handlePlayerTask(player_id: string, task: TaskName){
		const taskUpdate = await this.playerTasks.updateTask(player_id, task);
		return this.handleClanAndPlayerReward(player_id, taskUpdate);
	}

	private async handleClanAndPlayerReward(player_id: string, taskUpdate: TaskUpdateResult): Promise<[boolean, ServiceError[]]>{
		const { daily, weekly, monthly } = taskUpdate;
		if(daily.status !== 'done' && weekly.status !== 'done' && monthly.status !== 'done')
			return [ true, null ];
		
		const [ player, errors ] = await this.playerService.getPlayerById(player_id);
		
		if(errors)
			return [ null, errors ];

		const { clan_id } = player;

		if(daily.status === 'done'){
			await this.clanRewarder.rewardClanForPlayerTask(clan_id, this.convertTaskToReward(daily.task));
			await this.playerRewarder.rewardForPlayerTask(player_id, daily.task.points);
		}

		if(weekly.status === 'done'){
			await this.clanRewarder.rewardClanForPlayerTask(clan_id, this.convertTaskToReward(weekly.task));
			await this.playerRewarder.rewardForPlayerTask(player_id, weekly.task.points);
		}

		if(monthly.status === 'done'){
			await this.clanRewarder.rewardClanForPlayerTask(clan_id, this.convertTaskToReward(monthly.task));
			await this.playerRewarder.rewardForPlayerTask(player_id, monthly.task.points);
		}

		return [ true, null ];
	}

	private convertTaskToReward(task: Task): Reward{
		return { coins: task.coins, points: task.points };
	}
}
