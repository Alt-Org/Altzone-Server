import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ClanLeaderboardWinDocument } from './schemas/clanLeaderboardWin.schema';

/**
 * Owns persistence of accepted production clan wins.
 *
 * Recording eligibility and idempotent writes are added when the matchmaking
 * finish flow is connected to this model.
 */
@Injectable()
export class ClanLeaderboardWinService {
  constructor(
    @InjectModel(ModelName.CLAN_LEADERBOARD_WIN)
    readonly model: Model<ClanLeaderboardWinDocument>,
  ) {}
}
