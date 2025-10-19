import { Injectable } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { ClanService } from '../clan/clan.service';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import mongoose, { Model } from 'mongoose';
import { CacheKeys } from '../common/service/redis/cacheKeys.enum';
import { RedisService } from '../common/service/redis/redis.service';
import { PlayerDocument } from '../player/schemas/player.schema';
import { envVars } from '../common/service/envHandler/envVars';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
  ) {}

  /**
   * Leaderboard data update interval in seconds
   */
  private readonly LEADERBOARD_TTL_S = parseInt(
    envVars.LEADERBOARD_UPDATE_DELAY_SECONDS,
    10,
  );

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
      CacheKeys.CLAN_LEADERBOARD,
      this.clanService.model,
      reqQuery,
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
      CacheKeys.PLAYER_LEADERBOARD,
      this.playerService.model,
      reqQuery,
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
    reqQuery?: IGetAllQuery,
  ): Promise<object[]> {
    const dataRaw = await this.redisService.get(cacheKey);
    let data: object[] = JSON.parse(dataRaw);

    if (!data) {
      const fetchedData = await model.find().sort({ battlePoints: -1 }).exec();
      if (!fetchedData) throw new ServiceError({ reason: SEReason.NOT_FOUND });

      data = await this.processCacheData(model, fetchedData);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(data),
        this.LEADERBOARD_TTL_S,
      );
    }

    if (reqQuery) {
      data = this.sliceArray(data, reqQuery.limit, reqQuery.skip);
      if (data.length === 0) {
        throw new ServiceError({
          reason: SEReason.NOT_FOUND,
          message: 'No data found for the requested page.',
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
      CacheKeys.CLAN_LEADERBOARD,
      this.clanService.model,
    );

    const position = leaderboard.findIndex((clan) => clan['id'] == clanId) + 1;
    if (position === 0) throw new ServiceError({ reason: SEReason.NOT_FOUND });
    return { position };
  }

  /**
   * Processes cached data based on the provided model. If the model matches the player service's model,
   * it enriches the data by adding clan logo information. Otherwise, it returns the data as is.
   *
   * @param model - The model to compare against for determining the processing logic.
   * @param data - The array of data to be processed.
   * @returns A promise that resolves to the processed data.
   */
  private async processCacheData(model: Model<any>, data: any[]) {
    if (model === this.playerService.model) {
      return await this.addClanLogoData(data);
    }

    return data;
  }

  /**
   * Adds the clan logo data to the provided player data.
   *
   * @param data - An array of player documents to be enriched with clan logo data.
   * @returns A promise that resolves to an array of player objects with added `clanLogo` field.
   */
  private async addClanLogoData(data: PlayerDocument[]) {
    const clanIds = data.map((player) => player.clan_id);
    const clans = await this.clanService.model
      .find({ _id: { $in: clanIds } })
      .exec();

    const clanMap = clans.reduce((map, clan) => {
      map[clan._id] = clan.clanLogo;
      return map;
    }, {});

    return data.map((player) => ({
      ...player.toObject(),
      clanLogo: clanMap[player.clan_id] || null,
    }));
  }
}
