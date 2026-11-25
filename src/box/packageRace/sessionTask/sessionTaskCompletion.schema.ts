import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ModelName } from '../../../common/enum/modelName.enum';

export type SessionTaskCompletionDocument =
  HydratedDocument<SessionTaskCompletion>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class SessionTaskCompletion {
  /**
   * _id of the box session. Stored as a string like every other box_id.
   */
  @Prop({ type: String, required: true })
  box_id: string;

  /**
   * _id of the session team (clan) that received the points
   */
  @Prop({ type: ObjectId, required: true })
  team_id: ObjectId;

  /**
   * _id of the player who completed the session task
   */
  @Prop({ type: ObjectId, required: true })
  player_id: ObjectId;

  /**
   * Type of the completed session task
   */
  @Prop({ type: String, required: true })
  taskType: string;

  /**
   * _id of the completed task instance
   */
  @Prop({ type: ObjectId, default: null })
  task_id?: ObjectId | null;

  /**
   * Package race points the team received for this completion
   */
  @Prop({ type: Number, required: true, min: 0 })
  points: number;
}

export const SessionTaskCompletionSchema = SchemaFactory.createForClass(
  SessionTaskCompletion,
);
SessionTaskCompletionSchema.set(
  'collection',
  ModelName.SESSION_TASK_COMPLETION,
);
SessionTaskCompletionSchema.index(
  { box_id: 1, player_id: 1, taskType: 1 },
  { unique: true },
);
