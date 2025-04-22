import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Message } from './message.schema';

/**
 * The class contains data of game statistics
 * and meant to be used together with the Player as a nested object
 */
export class GameStatistics extends Document {
  /**
   * In how much battles the player participated in total
   */
  @Prop({ type: Number, default: 0 })
  playedBattles: number;

  /**
   * How much battles the player won in total
   */
  @Prop({ type: Number, default: 0 })
  wonBattles: number;

  /**
   * How much diamonds the player collected in total
   */
  @Prop({ type: Number, default: 0 })
  diamondsAmount: number;

  /**
   * How much votings the player started in total
   */
  @Prop({ type: Number, default: 0 })
  startedVotings: number;

  /**
   * In how much battles the player participated in total
   */
  @Prop({ type: Number, default: 0 })
  participatedVotings: number;

  /**
   * Array of messages
   */
  @Prop({ type: [Message], default: [] })
  messages: Message[];
}
