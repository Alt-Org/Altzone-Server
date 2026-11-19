import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';

export type ClanLeaderboardWinDocument = HydratedDocument<ClanLeaderboardWin>;

/**
 * An accepted production battle win attributed to the clan in which it was
 * earned. Persisting the clan ID keeps the win with that clan even if the
 * winning player later changes clans.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ClanLeaderboardWin {
  @Prop({ type: String, required: true })
  battleId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.CLAN,
    required: true,
  })
  clanId: string | ObjectId;

  @Prop({ type: Date, required: true })
  scoreReachedAt: Date;

  createdAt: Date;
}

export const ClanLeaderboardWinSchema =
  SchemaFactory.createForClass(ClanLeaderboardWin);

ClanLeaderboardWinSchema.set('collection', ModelName.CLAN_LEADERBOARD_WIN);
ClanLeaderboardWinSchema.index({ battleId: 1 }, { unique: true });
ClanLeaderboardWinSchema.index({ clanId: 1, scoreReachedAt: -1 });
