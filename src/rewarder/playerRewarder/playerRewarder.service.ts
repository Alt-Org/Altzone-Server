import { MongooseError } from "mongoose";
import { points } from "./points";
import { PlayerEvent } from "./enum/PlayerEvent.enum";
import { PlayerService } from "../../player/player.service";
import { Injectable } from "@nestjs/common";
import ServiceError from "../../common/service/basicService/ServiceError";
import { SEReason } from "../../common/service/basicService/SEReason";
import { Message } from "../../player/message.schema";

@Injectable()
export class PlayerRewarder {
	constructor(
		private readonly playerService: PlayerService
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
		if(playerEvent === PlayerEvent.MESSAGE_SENT)
			return this.rewardSendMessages(player_id);
		
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

	private async rewardSendMessages(player_id: string): Promise<[boolean, ServiceError[] | MongooseError]> {
		const today = new Date();

		const playerResp = await this.playerService.readOneById(player_id);
		if (playerResp instanceof MongooseError)
			return [false, playerResp];

		if (!playerResp.data[playerResp.metaData.dataKey])
			return [false, [new ServiceError({ reason: SEReason.NOT_FOUND, message: 'Could not read the player' })]];

		const player = playerResp.data[playerResp.metaData.dataKey];
		const messages: Message[] = player.gameStatistics.messages || [];
		const todaysMessage: Message = messages.find(message => message.date.toDateString() === today.toDateString());

		const messageCount = todaysMessage?.count;

		if (messageCount === 3)
			player.points += points[PlayerEvent.MESSAGE_SENT];

		const updateResp = await this.playerService.updateOneById({ ...player, _id: player_id });
		if (updateResp instanceof MongooseError)
			return [false, updateResp];

		return [true, null];
	}
}