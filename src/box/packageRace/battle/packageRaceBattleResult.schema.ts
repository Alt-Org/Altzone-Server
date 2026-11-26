import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ModelName } from '../../../common/enum/modelName.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';

export type PackageRaceBattleResultDocument =
  HydratedDocument<PackageRaceBattleResult>;

@Schema({ _id: false })
export class PackageRaceBattleTeamChange {
  /**
   * _id of the session team (clan) of the player
   */
  @Prop({ type: ObjectId, required: true })
  team_id: ObjectId;

  /**
   * _id of the player who played the battle for the team
   */
  @Prop({ type: ObjectId, required: true })
  player_id: ObjectId;

  @Prop({ type: String, enum: TeamSide, required: true })
  side: TeamSide;

  @Prop({ type: String, enum: ['WIN', 'LOSS'], required: true })
  outcome: 'WIN' | 'LOSS';

  /**
   * Battle points the outcome is worth (win is positive, loss is negative)
   */
  @Prop({ type: Number, required: true })
  points: number;

  /**
   * Battle points change that was actually applied to the team.
   * Differs from points only when a loss would take the team below 0.
   */
  @Prop({ type: Number, default: null })
  appliedPoints?: number | null;

  /**
   * Team battle points after the change was applied
   */
  @Prop({ type: Number, default: null })
  battlePointsAfter?: number | null;
}

const PackageRaceBattleTeamChangeSchema = SchemaFactory.createForClass(
  PackageRaceBattleTeamChange,
);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PackageRaceBattleResult {
  /**
   * _id of the box session. Stored as a string like every other box_id.
   */
  @Prop({ type: String, required: true })
  box_id: string;

  /**
   * _id of the matchmaking match
   */
  @Prop({ type: String, required: true })
  matchId: string;

  @Prop({ type: String, enum: MatchType, required: true })
  matchType: MatchType;

  @Prop({ type: String, enum: TeamSide, required: true })
  winningSide: TeamSide;

  @Prop({ type: Date, required: true })
  finishedAt: Date;

  /**
   * Changes of both teams of the battle
   */
  @Prop({ type: [PackageRaceBattleTeamChangeSchema], required: true })
  teams: PackageRaceBattleTeamChange[];
}

export const PackageRaceBattleResultSchema = SchemaFactory.createForClass(
  PackageRaceBattleResult,
);
PackageRaceBattleResultSchema.set(
  'collection',
  ModelName.PACKAGE_RACE_BATTLE_RESULT,
);
PackageRaceBattleResultSchema.index({ matchId: 1 }, { unique: true });
