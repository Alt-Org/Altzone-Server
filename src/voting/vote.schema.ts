import { Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { Prop } from "@nestjs/mongoose";
import { Choice } from "./type/choice.type";

export class Vote {
	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: ModelName.PLAYER,
		required: true,
	})
	player_id: string;

	@Prop({
		type: String,
		required: true,
	})
	choice: Choice;
}
