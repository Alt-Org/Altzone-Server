import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TaskName } from './enum/taskName.enum';

export type TaskProgressDocument = TaskProgress & Document;

@Schema()
export class TaskProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  playerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  taskId: number;

  @Prop({ required: true })
  progressAmount: number; // Current progress amount 

  @Prop({ required: true })
  targetAmount: number; // Amount needed to complete the task

  @Prop({ required: true, enum: TaskName })
  type: TaskName;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ required: true })
  expiryDate: Date;
}

export const TaskProgressSchema = SchemaFactory.createForClass(TaskProgress);