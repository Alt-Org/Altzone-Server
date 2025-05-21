import { Injectable } from '@nestjs/common';
import { CacheKeys } from '../common/service/redis/cacheKeys.enum';
import { PlayerService } from '../player/player.service';
import { IServiceReturn } from '../common/service/basicService/IService';
import { RedisService } from '../common/service/redis/redis.service';
import { OnlinePlayerStatus } from './enum/OnlinePlayerStatus';
import AddOnlinePlayer from './payload/AddOnlinePlayer';
import OnlinePlayer from './payload/OnlinePlayer';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { BattleWaitStatus } from './payload/additionalTypes/BattleWaitStatus';
import { BattleQueueService } from './battleQueue/battleQueue.service';

@Injectable()
export class OnlinePlayersService {
  private readonly ONLINE_PLAYERS_KEY = CacheKeys.ONLINE_PLAYERS;
  /**
   * Time-to-live in seconds (1.5 minutes)
   * @private
   */
  private readonly PLAYER_TTL_S = 90;

  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
    private readonly battleQueueService: BattleQueueService,
  ) {}

  /**
   * Adds a player to the online players list by storing their status in the cache.
   *
   * @param playerInfo - Information about player to be added
   * @returns Nothing or ServiceError if problems to find the player
   */
  async addPlayerOnline(
    playerInfo: AddOnlinePlayer,
  ): Promise<IServiceReturn<void>> {
    const { player_id, status } = playerInfo;

    const [player, errors] = await this.playerService.getPlayerById(player_id);
    if (errors) return [null, errors];

    const payload: OnlinePlayer = {
      _id: player_id,
      name: player.name,
      status: status ?? OnlinePlayerStatus.UI,
    };

    if (status === OnlinePlayerStatus.BATTLE_WAIT) {
      const [onlinePlayer] = await this.getOnlinePlayerById(player_id);
      const [queueNumber] =
        await this.battleQueueService.getPlayerQueueNumber(onlinePlayer);
      (payload as OnlinePlayer<BattleWaitStatus>).additional = { queueNumber };
    }

    await this.redisService.set(
      `${this.ONLINE_PLAYERS_KEY}:${player_id}`,
      JSON.stringify(payload),
      this.PLAYER_TTL_S,
    );
  }

  /**
   * Gets all the online players array.
   *
   * This method fetches all keys from the cache that match the pattern
   * for online players.
   *
   * @returns Array of OnlinePlayers or empty array if nothing found
   */
  async getAllOnlinePlayers(options?: {
    filter?: { status?: OnlinePlayerStatus[] };
  }): Promise<OnlinePlayer[]> {
    const players = await this.redisService.getValuesByKeyPattern(
      `${this.ONLINE_PLAYERS_KEY}:*`,
    );

    if (!players) return [];

    const onlinePlayers = Object.values(players).map((playerStr) =>
      JSON.parse(playerStr),
    ) as OnlinePlayer[];

    if (options?.filter?.status) {
      return onlinePlayers.filter((p) =>
        options.filter.status.includes(p.status),
      );
    }

    return onlinePlayers;
  }

  /**
   * Gets online player by its _id.
   *
   * @param player_id player _id to be found
   *
   * @returns found online player or ServiceError NOT_FOUND if player is not found
   */
  async getOnlinePlayerById(
    player_id: string,
  ): Promise<IServiceReturn<OnlinePlayer>> {
    const player = await this.redisService.get(
      `${this.ONLINE_PLAYERS_KEY}:${player_id}`,
    );
    if (!player)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id,
            message: 'Player with this _id is not found in online players',
          }),
        ],
      ];
    return [JSON.parse(player), null];
  }
}
