import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TaskName } from './enum/taskName.enum';
import { TaskFrequency } from './enum/taskFrequency.enum';


export type TaskProgressDocument = HydratedDocument<TaskProgress>;

@Schema()
export class TaskProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  playerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: TaskName })
  type: TaskName;

  @Prop({ required: true, default: () => new Date() })
  startedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop({ required: true, enum: TaskFrequency })
  frequency: TaskFrequency; // New property for daily, weekly, or monthly

  @Prop({ required: true })
  amountLeft: number; // Amount of atomic tasks to complete. When 0 set completedAt.

  @Prop({ required: true })
  coins: number; // Coins awarded upon completion

  @Prop({ required: true })
  points: number; // Points awarded upon completion
}

export const TaskProgressSchema = SchemaFactory.createForClass(TaskProgress);