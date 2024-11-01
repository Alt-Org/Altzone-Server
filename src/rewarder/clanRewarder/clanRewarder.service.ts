import { Injectable } from "@nestjs/common";
import { ClanService } from "../../clan/clan.service";
import { Reward } from "./points";

@Injectable()
export class ClanRewarder {
	constructor(
		private readonly clanService: ClanService,
	) { }

	/**
	 * Increases specified clan's points and coins
	 * @param clan_id clan _id for which to increase
	 * @param reward reward object with points and coins amounts
	 * @throws ServiceError if any occurred
	 * @returns tuple in form [ isSuccess, errors ]
	 */
	async rewardClanForPlayerTask(clan_id: string, reward: Reward){
		return this.addClanPointsAndCoins(clan_id, reward.points, reward.coins);
	}

	/**
	 * Increases specified clan points and coins amount
	 * @param clan_id clan _id for which to increase
	 * @param pointsToAdd amount of points to add, default 0
	 * @param consToAdd amount of coins to add, default 0
	 * @throws ServiceError if any occurred
	 * @returns tuple in form [ isSuccess, errors ]
	 */
	private async addClanPointsAndCoins(clan_id: string, pointsToAdd: number=0, coinsToAdd: number=0) {
		const [clanToUpdate, errors] = await this.clanService.readOneById(clan_id);

		if (errors)
			throw errors;

		const { points, gameCoins } = clanToUpdate;

		return await this.clanService.updateOne(
			{ 
				points: points + pointsToAdd, 
				gameCoins: gameCoins + coinsToAdd 
			},
			{ filter: { _id: clan_id } }
		);
	}
}