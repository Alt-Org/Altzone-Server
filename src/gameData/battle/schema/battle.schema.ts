import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { GameType } from '../enum/gameType.enum';
import { BattleStatus } from '../enum/battleStatus.enum';

/**
 * Type definition for a Battle document hydrated with Mongoose methods.
 */
export type BattleDocument = HydratedDocument<Battle>;

/**
 * Represents a competitive match record in the Altzone system.
 * Tracks player participation, submitted results, and final resolution.
 */
@Schema({ timestamps: true })
export class Battle {
  /** * Unique identifier for the match. 
   * Generated automatically if not provided during initialization.
   */
  @Prop({ type: String, required: true, unique: true })
  matchId: string;

  /** The category or mode of the game played (e.g., RANKED, CASUAL). */
  @Prop({ type: String, enum: GameType, required: true })
  gameType: GameType;

  /** The current state of the match in the "Odd Man Out" lifecycle. */
  @Prop({ type: String, enum: BattleStatus, default: BattleStatus.OPEN })
  status: BattleStatus;

  /** * The confirmed winning team (1 or 2). 
   * Populated only when the status transitions to COMPLETED.
   */
  @Prop({ type: Number })
  finalWinner?: number;

  /** * Collection of results reported by individual players.
   * Used to detect conflicts and calculate the final winner via majority vote.
   */
  @Prop({
    type: [{
      playerId: { type: MongooseSchema.Types.ObjectId, ref: ModelName.PLAYER },
      winnerTeam: Number, // 1 or 2
      duration: Number,
      receivedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  receivedResults: {
    /** Reference to the Player who submitted the result. */
    playerId: string;
    /** The team claimed as the winner by this player. */
    winnerTeam: number;
    /** The reported duration of the match session. */
    duration: number;
    /** Timestamp of when this specific result was received. */
    receivedAt?: Date;
  }[];

  /** List of Player ObjectIds belonging to Team 1. */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: ModelName.PLAYER }],
    required: true,
  })
  team1: string[];

  /** List of Player ObjectIds belonging to Team 2. */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: ModelName.PLAYER }],
    required: true,
  })
  team2: string[];
}

/**
 * Mongoose Schema definition for the Battle class.
 */
export const BattleSchema = SchemaFactory.createForClass(Battle);

/** Explicitly setting the collection name to 'battles'. */
BattleSchema.set('collection', 'battles');

/**
 * Pre-validation middleware to enforce data integrity.
 * - Ensures a player is not assigned to both teams simultaneously.
 * - Generates a fallback matchId if one is missing.
 */
BattleSchema.pre('validate', function (next) {
  const t1 = this.team1.map(id => id.toString());
  const t2 = this.team2.map(id => id.toString());
  
  const intersection = t1.filter(id => t2.includes(id));
  if (intersection.length > 0) {
    return next(new Error(`Player ${intersection[0]} cannot be on both teams`));
  }

  if (!this.matchId) {
    this.matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  next();
});