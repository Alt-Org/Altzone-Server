import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClanService } from '../clan/clan.service';
import { Environment } from '../common/enum/environment.enum';
import { ModelName } from '../common/enum/modelName.enum';
import { ActiveMatch } from '../matchmaking/type/activeMatch.type';
import { PlayerService } from '../player/player.service';
import { ClanLeaderboardWinDocument } from './schemas/clanLeaderboardWin.schema';
import { getAcceptedLeaderboardWin } from './util/getAcceptedLeaderboardWin';

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
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
  ) {}

  /**
   * Records an eligible win for the winner's current production clan.
   * Persisting clanId here ensures that the win does not move if the player
   * changes clans later. The battle ID makes retries successful no-ops.
   */
  async recordAcceptedClanWin(match: ActiveMatch): Promise<boolean> {
    const acceptedWin = getAcceptedLeaderboardWin(match);
    if (!acceptedWin) return false;

    const [player, playerErrors] = await this.playerService.getPlayerById(
      acceptedWin.winnerPlayerId,
    );
    if (playerErrors || !player?.clan_id) return false;

    const clanId = player.clan_id.toString();
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
      { upsert: true },
    );

    return result.upsertedCount === 1;
  }
}
