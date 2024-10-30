import { PlayerService } from "../../player/player.service";
import { MongooseError } from "mongoose";
import { points } from "./points";
import { PlayerEvent } from "./enum/PlayerEvent.enum";

export class PlayerRewarder {
	constructor(
		private readonly playerService: PlayerService,
	){
	}

	/**
	 * Rewards specified player for an event happen
	 * @param player_id player _id to reward
	 * @param playerEvent happen event
	 * @throws MongooseError if any occurred
	 * @returns true if player was rewarded successfully
	 */
	async rewardForPlayerEvent(player_id: string, playerEvent: PlayerEvent) {
		const pointAmount = points[playerEvent];
		return this.increasePlayerPoints(player_id, pointAmount);
	}

	/**
	 * Rewards specified player for a completed player task
	 * @param player_id player _id to reward
	 * @param points amount of points to reward
	 * @throws MongooseError if any occurred
	 * @returns true if player was rewarded successfully
	 */
	async rewardForPlayerTask(player_id: string, points: number) {
		return this.increasePlayerPoints(player_id, points);
	}

	/**
	 * Increases specified player points amount
	 * @param player_id player _id
	 * @param points amount of points to increase
	 * @throws MongooseError if any occurred
	 * @returns true if player was rewarded successfully
	 */
	private async increasePlayerPoints(player_id: string, points: number){
		const result = await this.playerService.updateOneById({
			_id: player_id,
			$inc: { points }
		});

		if (result instanceof MongooseError)
			throw result;

		return [true, null];
	}
}