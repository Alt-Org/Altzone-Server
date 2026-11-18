import { Injectable } from '@nestjs/common';
import { FriendshipService } from '../friendship/friendship.service';
import { PlayerService } from '../player/player.service';
import { LeaderboardCacheService } from './leaderboardCache.service';

/** Invalidates every cached view affected by a newly accepted win. */
@Injectable()
export class LeaderboardInvalidationService {
  constructor(
    private readonly cache: LeaderboardCacheService,
    private readonly playerService: PlayerService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async invalidatePlayerWin(playerId: string): Promise<void> {
    const scopes = new Set<string>([
      'players:global',
      `players:friends:${playerId}`,
    ]);

    const [playerResult, friendIdsResult] = await Promise.allSettled([
      this.playerService.getPlayerById(playerId),
      this.friendshipService.getAcceptedFriendPlayerIds(playerId),
    ]);

    if (playerResult.status === 'fulfilled') {
      const [player, errors] = playerResult.value;
      if (!errors && player?.clan_id) {
        scopes.add(`players:clan:${player.clan_id.toString()}`);
      }
    }

    if (friendIdsResult.status === 'fulfilled') {
      for (const friendId of friendIdsResult.value) {
        scopes.add(`players:friends:${friendId}`);
      }
    }

    await Promise.all(
      [...scopes].map((scope) => this.cache.invalidateScope(scope)),
    );
  }

  async invalidateClanWin(): Promise<void> {
    await this.cache.invalidateScope('clans:global');
  }
}
