import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { MatchType } from '../enum/matchType.enum';
import { TeamSide } from '../enum/teamSide.enum';

export type MatchmakingRewardClaimDocument =
  HydratedDocument<MatchmakingRewardClaim>;

/** Durable idempotency claim for all Mongo-backed matchmaking rewards. */
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class MatchmakingRewardClaim {
  @Prop({ type: String, required: true })
  battleId: string;

  @Prop({ type: String, enum: MatchType, required: true })
  matchType: MatchType;

  @Prop({ type: String, enum: TeamSide, required: true })
  winningSide: TeamSide;

  @Prop({ type: Date, required: true })
  finishedAt: Date;

  createdAt: Date;
}

export const MatchmakingRewardClaimSchema = SchemaFactory.createForClass(
  MatchmakingRewardClaim,
);

MatchmakingRewardClaimSchema.set(
  'collection',
  ModelName.MATCHMAKING_REWARD_CLAIM,
);
MatchmakingRewardClaimSchema.index({ battleId: 1 }, { unique: true });
