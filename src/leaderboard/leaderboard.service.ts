import { Inject, Injectable } from "@nestjs/common";
import { PlayerService } from "../player/player.service";
import { ClanService } from "../clan/clan.service";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import mongoose from "mongoose";

@Injectable()
export class LeaderboardService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheService: Cache,
		private readonly playerService: PlayerService,
		private readonly clanService: ClanService
	) {}

	/**
	 * Retrieves the clan leaderboard data.
	 *
	 * This method fetches and caches the clan leaderboard data based on the provided query parameters.
	 *
	 * @param reqQuery - The query parameters containing pagination info.
	 * @returns - A promise that resolves to the clan leaderboard data.
	 */
	async getClanLeaderboard(reqQuery: IGetAllQuery) {
		return this.getLeaderboard(
			"clanLeaderboard",
			this.clanService.model,
			reqQuery
		);
	}

	/**
	 * Retrieves the player leaderboard data.
	 *
	 * This method fetches and caches the player leaderboard data based on the provided query parameters.
	 *
	 * @param reqQuery - The query parameters containing pagination info.
	 * @returns - A promise that resolves to the player leaderboard data.
	 */
	async getPlayerLeaderboard(reqQuery: IGetAllQuery) {
		return this.getLeaderboard(
			"playerLeaderboard",
			this.playerService.model,
			reqQuery
		);
	}

	/**
	 * Generic method to fetch and cache leaderboard data.
	 *
	 * @param cacheKey - The key to use for caching.
	 * @param model - The Mongoose model to fetch data from. (Player | Clan)
	 * @param reqQuery - The query parameters containing pagination info.
	 * @returns - A subset of the data array based on the limit and skip values.
	 * @throws - If no data is found.
	 */
	private async getLeaderboard(
		cacheKey: string,
		model: mongoose.Model<any>,
		reqQuery?: IGetAllQuery
	): Promise<object[]> {
		let data: object[] = await this.cacheService.get(cacheKey);

		if (!data) {
			const fetchedData = await model.find().sort({ points: -1 }).exec();
			if (!fetchedData) throw new ServiceError({ reason: SEReason.NOT_FOUND });
			data = fetchedData;

			// Set the data with 12 hour ttl. The { ttl: number } as any is required to overwrite the default value.
			await this.cacheService.set(cacheKey, data, { ttl: 60 * 60 * 12 } as any);
		}

		if (reqQuery) {
			data = this.sliceArray(data, reqQuery.limit, reqQuery.skip);
			if (data.length === 0) {
				throw new ServiceError({
					reason: SEReason.NOT_FOUND,
					message: "No data found for the requested page.",
				});
			}
		}

		return data;
	}

	/**
	 * Slices the given data array based on the provided limit and skip values.
	 *
	 * @param data - The array of objects to slice.
	 * @param limit - The number of items to return.
	 * @param skip - The number of items to skip.
	 * @returns - A subset of the data array based on the limit and skip values.
	 */
	private sliceArray(data: object[], limit: number, skip: number): object[] {
		const start = Math.max(skip, 0);
		const end = start + limit;
		return data.slice(start, end);
	}

	/**
	 * Method to get the position on the clan leaderboard.
	 *
	 * @param clanId - The ID of the clan.
	 * @returns An object { position: number }
	 */
	async getClanPosition(clanId: string) {
		const leaderboard = await this.getLeaderboard(
			"clanLeaderboard",
			this.clanService.model
		);

		const position = leaderboard.findIndex((clan) => clan["id"] == clanId) + 1;
		if (position === 0) throw new ServiceError({ reason: SEReason.NOT_FOUND });
		return { position };
	}
}
