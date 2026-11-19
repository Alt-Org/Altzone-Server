import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ActiveMatch } from '../matchmaking/type/activeMatch.type';
import { PlayerLeaderboardWinDocument } from './schemas/playerLeaderboardWin.schema';
import { getAcceptedLeaderboardWin } from './util/getAcceptedLeaderboardWin';
import { LeaderboardInvalidationService } from './leaderboardInvalidation.service';

/**
 * Persists accepted production player wins for the win-based leaderboard.
 * This service is internal: clients must never increment leaderboard wins
 * directly.
 */
@Injectable()
export class PlayerLeaderboardWinService {
  constructor(
    @InjectModel(ModelName.PLAYER_LEADERBOARD_WIN)
    private readonly winModel: Model<PlayerLeaderboardWinDocument>,
    @Optional()
    private readonly invalidationService?: LeaderboardInvalidationService,
  ) {}

  /**
   * Records one eligible human 1v1 matchmaking win.
   *
   * The battle ID is the idempotency key. Reprocessing the same finished match
   * is a successful no-op and never changes the originally stored winner or
   * score-reached time.
   *
   * @returns true when a new win was inserted; false when the match is
   * ineligible or its win has already been recorded.
   */
  async recordAcceptedPlayerWin(match: ActiveMatch): Promise<boolean> {
    const acceptedWin = getAcceptedLeaderboardWin(match);
    if (!acceptedWin) return false;

    const result = await this.winModel.updateOne(
      { battleId: match.id },
      {
        $setOnInsert: {
          battleId: match.id,
          playerId: acceptedWin.winnerPlayerId,
          scoreReachedAt: acceptedWin.scoreReachedAt,
        },
      },
      { upsert: true },
    );

    const inserted = result.upsertedCount === 1;
    if (inserted) {
      await this.invalidationService?.invalidatePlayerWin(
        acceptedWin.winnerPlayerId,
      );
    }

    return inserted;
  }
}
