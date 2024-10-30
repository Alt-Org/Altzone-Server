import { Injectable } from '@nestjs/common';
import { PlayerService } from '../../player/player.service';
import { PlayerEvent } from '../../rewarder/playerRewarder/enum/PlayerEvent.enum';


@Injectable()
export class PlayerStatisticService {
	public constructor(
		private readonly playerService: PlayerService
	) {
	}

	async updatePlayerStatistic(player_id: string, playerEvent: PlayerEvent){
		switch (playerEvent) {
			case PlayerEvent.BATTLE_PLAYED:
				return this.playerService.updatePlayerById(player_id, { $inc: { 'gameStatistics.playedBattles': 1  } });
		
			case PlayerEvent.BATTLE_WON:
				return this.playerService.updatePlayerById(player_id, { $inc: { 'gameStatistics.wonBattles': 1  } });

			case PlayerEvent.VOTE_MADE:
				return this.playerService.updatePlayerById(player_id, { $inc: { 'gameStatistics.participatedVotings': 1 } });

			default:
				break;
		}
	}
}
