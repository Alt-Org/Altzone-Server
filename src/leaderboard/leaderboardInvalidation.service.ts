import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendshipService } from '../friendship/friendship.service';
import { PlayerService } from '../player/player.service';
import { LeaderboardCacheService } from './leaderboardCache.service';
import { PlayerLeaderboardWinDocument } from './schemas/playerLeaderboardWin.schema';

type PlayerDeletedEvent = {
  playerId: string;
  formerClanId?: string;
};

/** Invalidates every cached view affected by a newly accepted win. */
@Injectable()
export class LeaderboardInvalidationService {
  constructor(
    private readonly cache: LeaderboardCacheService,
    private readonly playerService: PlayerService,
    private readonly friendshipService: FriendshipService,
    @InjectModel(ModelName.PLAYER_LEADERBOARD_WIN)
    private readonly playerWinModel: Model<PlayerLeaderboardWinDocument>,
  ) {}

  async invalidatePlayerWin(
    playerId: string,
    knownClanId?: string,
  ): Promise<void> {
    const scopes = new Set<string>([
      'players:global',
      `players:friends:${playerId}`,
    ]);

    if (knownClanId) scopes.add(`players:clan:${knownClanId}`);

    const [playerResult, friendIdsResult] = await Promise.allSettled([
      knownClanId
        ? Promise.resolve(null)
        : this.playerService.getPlayerById(playerId),
      this.friendshipService.getAcceptedFriendPlayerIds(playerId),
    ]);

    if (playerResult.status === 'fulfilled' && playerResult.value) {
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

  @OnEvent('player.deleted')
  async handlePlayerDeleted(event: PlayerDeletedEvent): Promise<void> {
    await this.playerWinModel.deleteMany({ playerId: event.playerId });
    await this.invalidatePlayerWin(event.playerId, event.formerClanId);
  }
}
