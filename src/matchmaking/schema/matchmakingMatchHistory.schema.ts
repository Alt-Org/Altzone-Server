import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { MatchType } from '../enum/matchType.enum';
import { MatchFinishReason } from '../enum/matchFinishReason.enum';
import { TeamSide } from '../enum/teamSide.enum';

export enum MatchmakingOpponentType {
  HUMAN = 'HUMAN',
  BOT = 'BOT',
  MIXED = 'MIXED',
}

export enum MatchmakingParticipantOutcome {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW',
}

export enum MatchmakingRewardStatus {
  APPLIED = 'APPLIED',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
}

@Schema({ _id: false })
export class MatchmakingClanSnapshot {
  @Prop({ type: String, required: true })
  clanId: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  tag?: string;
}

const MatchmakingClanSnapshotSchema = SchemaFactory.createForClass(
  MatchmakingClanSnapshot,
);

@Schema({ _id: false })
export class MatchmakingParticipantSnapshot {
  @Prop({ type: Boolean, required: true })
  isBot: boolean;

  @Prop({ type: String })
  playerId?: string;

  @Prop({ type: String })
  botId?: string;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: MatchmakingClanSnapshotSchema })
  clan?: MatchmakingClanSnapshot;
}

const MatchmakingParticipantSnapshotSchema = SchemaFactory.createForClass(
  MatchmakingParticipantSnapshot,
);

@Schema({ _id: false })
export class MatchmakingTeamSnapshot {
  @Prop({ type: String, enum: TeamSide, required: true })
  side: TeamSide;

  @Prop({ type: MatchmakingClanSnapshotSchema })
  clan?: MatchmakingClanSnapshot;

  @Prop({
    type: [MatchmakingParticipantSnapshotSchema],
    required: true,
  })
  participants: MatchmakingParticipantSnapshot[];
}

const MatchmakingTeamSnapshotSchema = SchemaFactory.createForClass(
  MatchmakingTeamSnapshot,
);

@Schema({ _id: false })
export class MatchmakingTeamScore {
  @Prop({ type: String, enum: TeamSide, required: true })
  side: TeamSide;

  @Prop({ type: Number, required: true })
  score: number;
}

const MatchmakingTeamScoreSchema =
  SchemaFactory.createForClass(MatchmakingTeamScore);

@Schema({ _id: false })
export class MatchmakingMatchResult {
  @Prop({ type: String, enum: TeamSide, required: true })
  winningSide: TeamSide;

  @Prop({ type: String, enum: MatchFinishReason })
  finishReason?: MatchFinishReason;

  @Prop({ type: [MatchmakingTeamScoreSchema], default: undefined })
  teamScores?: MatchmakingTeamScore[];
}

const MatchmakingMatchResultSchema = SchemaFactory.createForClass(
  MatchmakingMatchResult,
);

@Schema({ _id: false })
export class MatchmakingParticipantStatisticsReward {
  @Prop({ type: Number, required: true })
  playedBattles: number;

  @Prop({ type: Number, required: true })
  wonBattles: number;
}

const MatchmakingParticipantStatisticsRewardSchema =
  SchemaFactory.createForClass(MatchmakingParticipantStatisticsReward);

@Schema({ _id: false })
export class MatchmakingParticipantReward {
  @Prop({ type: String, required: true })
  playerId: string;

  @Prop({
    type: String,
    enum: MatchmakingParticipantOutcome,
    required: true,
  })
  outcome: MatchmakingParticipantOutcome;

  @Prop({ type: Number, required: true })
  battlePoints: number;

  @Prop({
    type: MatchmakingParticipantStatisticsRewardSchema,
    required: true,
  })
  statistics: MatchmakingParticipantStatisticsReward;
}

const MatchmakingParticipantRewardSchema = SchemaFactory.createForClass(
  MatchmakingParticipantReward,
);

export type MatchmakingMatchHistoryDocument =
  HydratedDocument<MatchmakingMatchHistory>;

/**
 * Permanent, authoritative record of a completed matchmaking match.
 *
 * Presentation fields are snapshots and must not be used as the current player
 * or clan presentation in leaderboard responses. Leaderboard scores are based
 * on accepted wins, not on the battle-point rewards recorded here.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class MatchmakingMatchHistory {
  @Prop({ type: String, required: true })
  matchId: string;

  @Prop({ type: String, enum: MatchType, required: true })
  matchType: MatchType;

  @Prop({ type: Number, required: true })
  gameType: number;

  @Prop({ type: Number, enum: [1, 2], required: true })
  teamSize: 1 | 2;

  @Prop({ type: String, enum: MatchmakingOpponentType, required: true })
  opponentType: MatchmakingOpponentType;

  @Prop({ type: [MatchmakingTeamSnapshotSchema], required: true })
  teams: MatchmakingTeamSnapshot[];

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date })
  battleStartedAt?: Date;

  @Prop({ type: Date, required: true })
  finishedAt: Date;

  @Prop({ type: MatchmakingMatchResultSchema, required: true })
  result: MatchmakingMatchResult;

  @Prop({ type: [MatchmakingParticipantRewardSchema], default: [] })
  rewards: MatchmakingParticipantReward[];

  @Prop({ type: String, enum: MatchmakingRewardStatus, required: true })
  rewardStatus: MatchmakingRewardStatus;

  createdAt: Date;
}

export const MatchmakingMatchHistorySchema = SchemaFactory.createForClass(
  MatchmakingMatchHistory,
);

MatchmakingMatchHistorySchema.set(
  'collection',
  ModelName.MATCHMAKING_MATCH_HISTORY,
);

MatchmakingMatchHistorySchema.index(
  { matchId: 1 },
  { name: 'uniq_matchmaking_match_history_match_id', unique: true },
);
MatchmakingMatchHistorySchema.index(
  { 'teams.participants.playerId': 1, finishedAt: -1 },
  { name: 'matchmaking_history_player_finished_at' },
);
MatchmakingMatchHistorySchema.index(
  { 'teams.clan.clanId': 1, finishedAt: -1 },
  { name: 'matchmaking_history_clan_finished_at' },
);
