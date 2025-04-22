import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CacheKeys } from '../common/enum/cacheKeys.enum';
import { PlayerService } from 'src/player/player.service';
import { IServiceReturn } from 'src/common/service/basicService/IService';

@Injectable()
export class OnlinePlayersService {
  private readonly ONLINE_PLAYERS_KEY = CacheKeys.ONLINE_PLAYERS;
  private readonly PLAYER_TTL = 300; // Time-to-live in seconds (5 minutes)

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
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

    await this.cacheService.set(
      `${this.ONLINE_PLAYERS_KEY}:${JSON.stringify(payload)}`,
      '1',
      {
        ttl: this.PLAYER_TTL,
      } as any,
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
    const players = await this.cacheService.store.keys(
      `${this.ONLINE_PLAYERS_KEY}:*`,
    );

    if (!players) return [];

    const ids = players.map((player) => {
      const playerData = player.replace(`${this.ONLINE_PLAYERS_KEY}:`, '');
      return JSON.parse(playerData);
    });

    return ids;
  }
}
