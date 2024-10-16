import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { Player } from '../player/player.schema';


export type TaskProgressDocument = HydratedDocument<TaskProgress>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } } )
export class TaskProgress {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  playerId: Player;

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
TaskProgressSchema.set("collection", ModelName.PLAYER_TASK);
TaskProgressSchema.virtual(ModelName.PLAYER, {
  ref: ModelName.PLAYER,
  localField: "playerId",
  foreignField: "_id",
  justOne: true,
})