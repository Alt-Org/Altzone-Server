import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents a message in the game statistics.
 *
 * This class is used for tracking the amount of player message
 * in order to grant points to the player.
 */
export class Message extends Document {
  /**
   * The date of the messages.
   */
  @Prop({ type: Date, required: true })
  date: Date;

  /**
   * The count of messages on the given date.
   */
  @Prop({ type: Number, default: 1 })
  count: number;
}
