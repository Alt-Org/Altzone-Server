import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { PlayerService } from "../player/player.service";
import { ClanService } from "../clan/clan.service";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { APIError } from "../common/controller/APIError";
import { APIErrorReason } from "../common/controller/APIErrorReason";

@Injectable()
export class LeaderboardService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheService: Cache,
		@Inject(forwardRef(() => PlayerService))
		private readonly playerService: PlayerService,
		@Inject(forwardRef(() => ClanService))
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
			this.clanService.readAll.bind(this.clanService),
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
			this.playerService.getAll.bind(this.playerService),
			reqQuery
		);
	}

	/**
	 * Generic method to fetch and cache leaderboard data.
	 *
	 * @param cacheKey - The key to use for caching.
	 * @param fetchFunction - The function to fetch data from the database.
	 * @param reqQuery - The query parameters containing pagination info.
	 * @returns - A subset of the data array based on the limit and skip values.
	 * @throws - If no data is found.
	 */
	private async getLeaderboard(
		cacheKey: string,
		fetchFunction: (query: IGetAllQuery) => Promise<any>,
		reqQuery: IGetAllQuery
	): Promise<object[]> {
		let data: object[] = await this.cacheService.get(cacheKey);

		if (!data) {
			const query: IGetAllQuery = {
				filter: {},
				limit: 1000,
				sort: { points: -1 },
				skip: 0,
			};
			const [data, errors] = await fetchFunction(query);
			if (errors) throw new InternalServerErrorException({ errors });

			// Set the data with 12 hour ttl. The { ttl: number } as any is required to overwrite the default value.
			await this.cacheService.set(cacheKey, data, { ttl: 60 * 60 * 12 } as any);
		}

		const slicedData = this.sliceArray(data, reqQuery.limit, reqQuery.skip);
		if (slicedData.length === 0)
			throw new APIError({
				reason: APIErrorReason.NOT_FOUND,
				message: "No data found for the requested page.",
			});

		return slicedData;
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
}
