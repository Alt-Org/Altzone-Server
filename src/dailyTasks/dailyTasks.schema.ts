import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { TaskName } from "./enum/taskName.enum";
import {TaskTitle} from "./type/taskTitle.type";
import {ExtractField} from "../common/decorator/response/ExtractField";
import {ObjectId} from "mongodb";

export type DailyTaskDocument = HydratedDocument<DailyTask>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class DailyTask {
	@Prop({ type: MongooseSchema.Types.ObjectId, required: true })
	clan_id: string;

	@Prop({ type: MongooseSchema.Types.ObjectId })
	player_id?: string;

	@Prop({ type: Object, required: true })
	title: TaskTitle;

	@Prop({ type: String, enum: TaskName, required: true })
	type: TaskName;

	@Prop({ type: Date })
	startedAt?: Date;

	@Prop({ type: Number, required: true })
	points: number;

	@Prop({ type: Number, required: true })
	coins: number;

	@Prop({ type: Number, required: true })
	amount: number;

	@Prop({ type: Number, required: true })
	amountLeft: number; // Amount of atomic tasks to complete. When 0 set completedAt.

	@Prop({ type: Number, required: true })
	timeLimitMinutes: number;

	@ExtractField()
	_id?: string | ObjectId;
}

export const DailyTaskSchema = SchemaFactory.createForClass(DailyTask);
DailyTaskSchema.set("collection", ModelName.DAILY_TASK);
DailyTaskSchema.index({ playerId: 1 }, { unique: true, sparse: true });
DailyTaskSchema.virtual(ModelName.PLAYER, {
	ref: ModelName.PLAYER,
	localField: "player_id",
	foreignField: "_id",
	justOne: true,
});
DailyTaskSchema.virtual(ModelName.CLAN, {
	ref: ModelName.CLAN,
	localField: "clan_id",
	foreignField: "_id",
	justOne: true,
});
