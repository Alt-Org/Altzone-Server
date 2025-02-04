import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { TaskName } from "./enum/taskName.enum";

export type DailyTaskDocument = HydratedDocument<DailyTask>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DailyTask {
	@Prop({ type: MongooseSchema.Types.ObjectId, required: true })
	clanId: string;

	@Prop({ type: MongooseSchema.Types.ObjectId })
	playerId?: string;

	@Prop({ type: Object, required: true })
	title: { fi: string };

	@Prop({ type: String, enum: TaskName, required: true })
	type: TaskName;

	@Prop({ type: Date })
	startedAt?: Date;

	@Prop({ type: Number, required: true })
	points: number;

	@Prop({ type: Number, required: true })
	coins: number;

	@Prop({ required: true })
	amountLeft: number; // Amount of atomic tasks to complete. When 0 set completedAt.
}

export const DailyTaskSchema = SchemaFactory.createForClass(DailyTask);
DailyTaskSchema.set("collection", ModelName.DAILY_TASK);
DailyTaskSchema.index({ playerId: 1 }, { unique: true, sparse: true });
DailyTaskSchema.virtual(ModelName.PLAYER, {
	ref: ModelName.PLAYER,
	localField: "playerId",
	foreignField: "_id",
	justOne: true,
});
