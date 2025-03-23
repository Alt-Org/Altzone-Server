import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ServerTaskName} from "../../dailyTasks/enum/serverTaskName.enum";
import {HydratedDocument} from "mongoose";
import {ObjectId} from "mongodb";

export type PredefinedDailyTaskDoc = HydratedDocument<PredefinedDailyTask>;

@Schema({ _id: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class PredefinedDailyTask {
    @Prop({ type: String, required: true, enum: ServerTaskName })
    type: ServerTaskName;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: Number, required: true })
    points: number;

    @Prop({ type: Number, required: true })
    coins: number;

    @Prop({ type: Number, required: true })
    timeLimitMinutes: number;

    _id: ObjectId;
}

export const PredefinedDailyTaskSchema = SchemaFactory.createForClass(PredefinedDailyTask);
