import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";

export type DailyTaskDocument = HydratedDocument<DailyTask>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DailyTask {
	@Prop({ type: MongooseSchema.Types.ObjectId, required: true })
	clanId: string;

	@Prop({ type: MongooseSchema.Types.ObjectId })
	playerId?: string;

	@Prop({ type: Date })
	startedAt?: Date;

	@Prop({ type: Number, required: true })
	points: number;

	@Prop({ type: Number, required: true })
	coins: number;

	@Prop({ type: Date, default: null })
	completedAt: Date;

	@Prop({ required: true })
	amountLeft: number; // Amount of atomic tasks to complete. When 0 set completedAt.
}

export const DailyTaskSchema = SchemaFactory.createForClass(DailyTask);
DailyTaskSchema.set("collection", ModelName.DAILY_TASK);
DailyTaskSchema.virtual(ModelName.PLAYER, {
	ref: ModelName.PLAYER,
	localField: "playerId",
	foreignField: "_id",
	justOne: true,
});
