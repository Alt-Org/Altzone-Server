import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { TaskName } from './enum/taskName.enum';
import { TaskFrequency } from './enum/taskFrequency.enum';


export type TaskProgressDocument = HydratedDocument<TaskProgress>;

@Schema()
export class TaskProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  playerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  taskId: number;

  @Prop({ required: true, default: () => new Date() })
  startedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop({ required: true })
  amountLeft: number; // Amount of atomic tasks to complete. When 0 set completedAt.
}

export const TaskProgressSchema = SchemaFactory.createForClass(TaskProgress);