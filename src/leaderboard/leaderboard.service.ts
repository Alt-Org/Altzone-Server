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
import { Environment } from '../common/enum/environment.enum';
import { Environment as ServerEnvironment } from '../common/service/envHandler/enum/environment.enum';
import { Types } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import {
  GlobalPlayerLeaderboardEntry,
  GlobalPlayerLeaderboardResult,
} from './type/globalPlayerLeaderboard.type';
import {
  GlobalClanLeaderboardEntry,
  GlobalClanLeaderboardResult,
} from './type/globalClanLeaderboard.type';

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
   * @param environment - The environment of the clan.
   * @returns - A promise that resolves to the clan leaderboard data.
   */
  async getClanLeaderboard(reqQuery: IGetAllQuery, environment?: Environment) {
    return this.getLeaderboard(
      CacheKeys.CLAN_LEADERBOARD,
      this.clanService.model,
      environment,
      reqQuery,
    );
  }

  /**
   * Retrieves the player leaderboard data.
   *
   * This method fetches and caches the player leaderboard data based on the provided query parameters.
   *
   * @param reqQuery - The query parameters containing pagination info.
   * @param environment - The environment of the clan.
   * @returns - A promise that resolves to the player leaderboard data.
   */
  async getPlayerLeaderboard(
    reqQuery: IGetAllQuery,
    environment?: Environment,
  ) {
    return this.getLeaderboard(
      CacheKeys.PLAYER_LEADERBOARD,
      this.playerService.model,
      environment,
      reqQuery,
    );
  }

  /**
   * Retrieves one page of the production player leaderboard.
   *
   * Ranking is calculated after filtering the player population and before
   * pagination. Accepted wins are the only score source. Presentation data is
   * read from the current player and clan documents.
   */
  async getGlobalPlayerLeaderboard(
    reqQuery: IGetAllQuery,
    requestingPlayerId?: string,
  ): Promise<GlobalPlayerLeaderboardResult> {
    if (envVars.ENVIRONMENT === ServerEnvironment.TESTING_SESSION) {
      return { entries: [], ownRank: null, itemCount: 0 };
    }

    const requestingPlayerObjectId =
      requestingPlayerId && Types.ObjectId.isValid(requestingPlayerId)
        ? new Types.ObjectId(requestingPlayerId)
        : null;

    type AggregationResult = {
      entries: GlobalPlayerLeaderboardEntry[];
      ownRank: { rank: number }[];
      total: { count: number }[];
    };

    const [result] = await this.playerService.model
      .aggregate<AggregationResult>([
        // Testing-session players share the Player collection but are marked
        // with a box_id. Exclude them before scoring, ranking and pagination.
        {
          $match: {
            $or: [{ box_id: null }, { box_id: { $exists: false } }],
          },
        },
        {
          $lookup: {
            from: ModelName.PLAYER_LEADERBOARD_WIN,
            localField: '_id',
            foreignField: 'playerId',
            as: 'acceptedWins',
          },
        },
        {
          $set: {
            wins: { $size: '$acceptedWins' },
            scoreReachedAt: {
              $cond: [
                { $gt: [{ $size: '$acceptedWins' }, 0] },
                { $max: '$acceptedWins.scoreReachedAt' },
                '$createdAt',
              ],
            },
          },
        },
        {
          $lookup: {
            from: ModelName.CLAN,
            localField: 'clan_id',
            foreignField: '_id',
            as: 'currentClan',
          },
        },
        {
          $unwind: {
            path: '$currentClan',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $setWindowFields: {
            sortBy: { wins: -1, scoreReachedAt: 1, _id: 1 },
            output: {
              rank: {
                $sum: 1,
                window: { documents: ['unbounded', 'current'] },
              },
            },
          },
        },
        {
          $facet: {
            entries: [
              { $skip: Math.max(reqQuery.skip, 0) },
              { $limit: reqQuery.limit },
              {
                $project: {
                  _id: 0,
                  rank: 1,
                  wins: 1,
                  playerId: { $toString: '$_id' },
                  nickname: '$name',
                  avatar: { $ifNull: ['$avatar', null] },
                  clan: {
                    $cond: [
                      { $ne: [{ $ifNull: ['$currentClan', null] }, null] },
                      {
                        clanId: { $toString: '$currentClan._id' },
                        name: '$currentClan.name',
                        logo: '$currentClan.clanLogo',
                      },
                      null,
                    ],
                  },
                },
              },
            ],
            ownRank: requestingPlayerObjectId
              ? [
                  { $match: { _id: requestingPlayerObjectId } },
                  { $project: { _id: 0, rank: 1 } },
                ]
              : [{ $match: { _id: { $exists: false } } }],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    return {
      entries: result?.entries ?? [],
      ownRank: result?.ownRank[0]?.rank ?? null,
      itemCount: result?.total[0]?.count ?? 0,
    };
  }

  /**
   * Retrieves one page of the production clan leaderboard.
   *
   * A clan's score consists only of accepted wins attributed to that clan at
   * the time they were earned. Ranking is calculated before pagination and is
   * deterministic for clans with equal win counts.
   */
  async getGlobalClanLeaderboard(
    reqQuery: IGetAllQuery,
    requestingPlayerId?: string,
  ): Promise<GlobalClanLeaderboardResult> {
    if (envVars.ENVIRONMENT === ServerEnvironment.TESTING_SESSION) {
      return { entries: [], ownRank: null, itemCount: 0 };
    }

    const requestingPlayerObjectId =
      requestingPlayerId && Types.ObjectId.isValid(requestingPlayerId)
        ? new Types.ObjectId(requestingPlayerId)
        : null;

    let requestingClanObjectId: Types.ObjectId | null = null;
    if (requestingPlayerObjectId) {
      const [requestingPlayer] = await this.playerService.model
        .aggregate<{
          clan_id?: Types.ObjectId;
          box_id?: Types.ObjectId;
          environment?: Environment;
        }>([
          { $match: { _id: requestingPlayerObjectId } },
          { $project: { clan_id: 1, box_id: 1, environment: 1 } },
        ])
        .exec();

      if (
        !requestingPlayer?.box_id &&
        requestingPlayer?.environment === Environment.OPEN_DEMO &&
        requestingPlayer?.clan_id
      ) {
        requestingClanObjectId = requestingPlayer.clan_id;
      }
    }

    type AggregationResult = {
      entries: GlobalClanLeaderboardEntry[];
      ownRank: { rank: number }[];
      total: { count: number }[];
    };

    const [result] = await this.clanService.model
      .aggregate<AggregationResult>([
        // Teaching/package-race clans must never enter the production ranking.
        { $match: { environment: Environment.OPEN_DEMO } },
        {
          $lookup: {
            from: ModelName.CLAN_LEADERBOARD_WIN,
            localField: '_id',
            foreignField: 'clanId',
            as: 'acceptedWins',
          },
        },
        {
          $set: {
            wins: { $size: '$acceptedWins' },
            scoreReachedAt: {
              $cond: [
                { $gt: [{ $size: '$acceptedWins' }, 0] },
                { $max: '$acceptedWins.scoreReachedAt' },
                '$createdAt',
              ],
            },
          },
        },
        {
          $setWindowFields: {
            sortBy: { wins: -1, scoreReachedAt: 1, _id: 1 },
            output: {
              rank: {
                $sum: 1,
                window: { documents: ['unbounded', 'current'] },
              },
            },
          },
        },
        {
          $facet: {
            entries: [
              { $skip: Math.max(reqQuery.skip, 0) },
              { $limit: reqQuery.limit },
              {
                $project: {
                  _id: 0,
                  rank: 1,
                  wins: 1,
                  clanId: { $toString: '$_id' },
                  name: 1,
                  logo: { $ifNull: ['$clanLogo', null] },
                },
              },
            ],
            ownRank: requestingClanObjectId
              ? [
                  { $match: { _id: requestingClanObjectId } },
                  { $project: { _id: 0, rank: 1 } },
                ]
              : [{ $match: { _id: { $exists: false } } }],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    return {
      entries: result?.entries ?? [],
      ownRank: result?.ownRank[0]?.rank ?? null,
      itemCount: result?.total[0]?.count ?? 0,
    };
  }

  /**
   * Generic method to fetch and cache leaderboard data.
   *
   * @param cacheKey - The key to use for caching.
   * @param model - The Mongoose model to fetch data from. (Player | Clan)
   * @param reqQuery - The query parameters containing pagination info.
   * @param environment - The environment value (Player | Clan).
   * @returns - A subset of the data array based on the limit and skip values.
   * @throws - If no data is found.
   */
  private async getLeaderboard(
    cacheKey: string,
    model: mongoose.Model<any>,
    environment?: Environment,
    reqQuery?: IGetAllQuery,
  ): Promise<object[]> {
    const dataRaw = await this.redisService.get(cacheKey);
    let data: object[] = JSON.parse(dataRaw);

    if (!data) {
      const fetchedData =
        environment !== undefined
          ? await model.find({ environment }).sort({ battlePoints: -1 }).exec()
          : await model.find().sort({ battlePoints: -1 }).exec();

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
    const [clan, clanErrors] = await this.clanService.readOneById(clanId);

    if (!clan || clanErrors) {
      throw new ServiceError({
        reason: SEReason.NOT_FOUND,
        message: 'Clan not found',
      });
    }

    const environment = clan.environment;
    const leaderboard = await this.getLeaderboard(
      CacheKeys.CLAN_LEADERBOARD,
      this.clanService.model,
      environment,
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
