import { Injectable } from '@nestjs/common';
import { CacheKeys } from '../common/enum/cacheKeys.enum';
import { PlayerService } from '../player/player.service';
import { IServiceReturn } from '../common/service/basicService/IService';
import { RedisService } from '../common/service/redis/redis.service';

@Injectable()
export class OnlinePlayersService {
  private readonly ONLINE_PLAYERS_KEY = CacheKeys.ONLINE_PLAYERS;
  private readonly PLAYER_TTL = 300; // Time-to-live in seconds (5 minutes)

  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Adds a player to the online players list by storing their status in the cache.
   *
   * @param playerId - The unique identifier of the player to be marked as online.
   * @returns A promise that resolves when the player's online status is successfully stored.
   */
  async addPlayerOnline(playerId: string): Promise<IServiceReturn<void>> {
    const [player, error] = await this.playerService.getPlayerById(playerId);
    if (error) return [null, error];

    const payload = {
      id: playerId,
      name: player.name,
    };

    await this.redisService.set(
      `${this.ONLINE_PLAYERS_KEY}:${JSON.stringify(payload)}`,
      '1',
      this.PLAYER_TTL * 1000,
    );
  }

  /**
   * Gets all the online players and returns data as JSON object.
   *
   * This method fetches all keys from the cache that match the pattern
   * for online players.
   *
   * @returns Array of player name and id as JSON objects.
   */
  async getAllOnlinePlayers(): Promise<{ id: string; name: string }[]> {
    const players = await this.redisService.getKeys(
      `${this.ONLINE_PLAYERS_KEY}:*`,
    );

    if (!players) return [];

    return players.map((player) => {
      const playerData = player.replace(`${this.ONLINE_PLAYERS_KEY}:`, '');
      return JSON.parse(playerData);
    });
  }
}
