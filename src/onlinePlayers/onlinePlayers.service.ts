import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OnlinePlayersService {
  private readonly ONLINE_PLAYERS_KEY = 'online_players';
  private readonly PLAYER_TTL = 300; // Time-to-live in seconds (5 minutes)

  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}

  /**
   * Adds a player to the online players list by storing their status in the cache.
   *
   * @param playerId - The unique identifier of the player to be marked as online.
   * @returns A promise that resolves when the player's online status is successfully stored.
   */
  async addPlayerOnline(playerId: string): Promise<void> {
    await this.cacheService.set(`${this.ONLINE_PLAYERS_KEY}:${playerId}`, '1', {
      ttl: this.PLAYER_TTL,
    } as any);
  }

  /**
   * Gets all the online players and returns their IDs.
   *
   * This method fetches all keys from the cache that match the pattern
   * for online players and returns the player IDs.
   *
   * @returns Array of player IDs.
   */
  async getAllOnlinePlayers(): Promise<string[]> {
    const players = await this.cacheService.store.keys(
      `${this.ONLINE_PLAYERS_KEY}:*`,
    );

    if (!players) return [];

    const ids = players.map((player) => {
      return player.replace(`${this.ONLINE_PLAYERS_KEY}:`, '');
    });

    return ids;
  }
}
