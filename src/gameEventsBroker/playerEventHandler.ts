import { Injectable } from '@nestjs/common';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { PlayerStatisticService } from '../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';
import ServiceError from '../common/service/basicService/ServiceError';

@Injectable()
export class PlayerEventHandler {
	constructor(
		private readonly playerRewarder: PlayerRewarder,
		private readonly playerStatistics: PlayerStatisticService
	) {

	}

	async handlePlayerEvent(player_id: string, event: PlayerEvent): Promise<[boolean, ServiceError[]]> {
		await this.playerStatistics.updatePlayerStatistic(player_id, event);
		await this.playerRewarder.rewardForPlayerEvent(player_id, event);
		return [true, null];
	}
}
