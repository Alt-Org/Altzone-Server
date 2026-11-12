import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';

export type PlayerLeaderboardWinDocument =
  HydratedDocument<PlayerLeaderboardWin>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PlayerLeaderboardWin {
  @Prop({ type: String, required: true })
  battleId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  playerId: string | ObjectId;

  @Prop({ type: Date, required: true })
  scoreReachedAt: Date;

  createdAt: Date;
}

export const PlayerLeaderboardWinSchema =
  SchemaFactory.createForClass(PlayerLeaderboardWin);

PlayerLeaderboardWinSchema.set('collection', ModelName.PLAYER_LEADERBOARD_WIN);
PlayerLeaderboardWinSchema.index({ battleId: 1 }, { unique: true });
PlayerLeaderboardWinSchema.index({ playerId: 1, scoreReachedAt: -1 });
