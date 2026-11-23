import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ClanService } from '../clan/clan.service';
import { Environment } from '../common/enum/environment.enum';
import { ModelName } from '../common/enum/modelName.enum';
import { MatchType } from '../matchmaking/enum/matchType.enum';
import { ActiveMatch } from '../matchmaking/type/activeMatch.type';
import { ClanLeaderboardWinDocument } from './schemas/clanLeaderboardWin.schema';
import { getAcceptedLeaderboardWin } from './util/getAcceptedLeaderboardWin';
import { LeaderboardInvalidationService } from './leaderboardInvalidation.service';

/**
 * Owns persistence of accepted production clan wins.
 *
 * This service is internal: clients must never increment leaderboard wins
 * directly.
 */
@Injectable()
export class ClanLeaderboardWinService {
  constructor(
    @InjectModel(ModelName.CLAN_LEADERBOARD_WIN)
    private readonly winModel: Model<ClanLeaderboardWinDocument>,
    private readonly clanService: ClanService,
    @Optional()
    private readonly invalidationService?: LeaderboardInvalidationService,
  ) {}

  /**
   * Records an eligible CLAN win for the clan captured on the winning match
   * side. Historical wins therefore cannot move when a player changes clans.
   * The battle ID makes retries successful no-ops.
   */
  async recordAcceptedClanWin(
    match: ActiveMatch,
    session?: ClientSession,
  ): Promise<boolean> {
    const acceptedWin = getAcceptedLeaderboardWin(match);
    if (!acceptedWin || match.matchType !== MatchType.CLAN) return false;

    const winningTeam = match.teams.find(
      (team) => team.side === match.result?.winningSide,
    );
    if (!winningTeam?.clanId) return false;

    const winnerBelongsToTeam = winningTeam.participants.some(
      (participant) =>
        participant.isBot === false &&
        participant.playerId === acceptedWin.winnerPlayerId,
    );
    if (!winnerBelongsToTeam) return false;

    const clanId = winningTeam.clanId;
    const [clan, clanErrors] = await this.clanService.readOneById(clanId);
    if (clanErrors || !clan || clan.environment !== Environment.OPEN_DEMO) {
      return false;
    }

    const result = await this.winModel.updateOne(
      { battleId: match.id },
      {
        $setOnInsert: {
          battleId: match.id,
          clanId,
          scoreReachedAt: acceptedWin.scoreReachedAt,
        },
      },
      { upsert: true, session },
    );

    const inserted = result.upsertedCount === 1;
    if (inserted && !session) {
      await this.invalidationService?.invalidateClanWin();
    }

    return inserted;
  }
}
