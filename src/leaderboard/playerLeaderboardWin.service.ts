import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { envVars } from '../common/service/envHandler/envVars';
import { Environment } from '../common/service/envHandler/enum/environment.enum';
import { MatchStatus } from '../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../matchmaking/enum/matchType.enum';
import { ActiveMatch } from '../matchmaking/type/activeMatch.type';
import { PlayerLeaderboardWinDocument } from './schemas/playerLeaderboardWin.schema';

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
    if (envVars.ENVIRONMENT === Environment.TESTING_SESSION) return false;
    if (match.status !== MatchStatus.FINISHED) return false;
    if (match.matchType === MatchType.CUSTOM || match.teamSize !== 1) {
      return false;
    }
    if (!match.result?.winningSide || !match.finishedAt) return false;

    const teams = match.teams;
    if (
      teams.length !== 2 ||
      teams.some(
        (team) => team.participants.length !== 1 || team.participants[0].isBot,
      )
    ) {
      return false;
    }

    const winningTeam = teams.find(
      (team) => team.side === match.result?.winningSide,
    );
    const winner = winningTeam?.participants[0];
    if (!winner || winner.isBot !== false) return false;

    const scoreReachedAt = new Date(match.finishedAt);
    if (Number.isNaN(scoreReachedAt.getTime())) return false;

    const result = await this.winModel.updateOne(
      { battleId: match.id },
      {
        $setOnInsert: {
          battleId: match.id,
          playerId: winner.playerId,
          scoreReachedAt,
        },
      },
      { upsert: true },
    );

    return result.upsertedCount === 1;
  }
}
