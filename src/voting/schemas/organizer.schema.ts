import { Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../../common/enum/modelName.enum";
import { Prop } from "@nestjs/mongoose";

export class Organizer {
	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: ModelName.PLAYER,
		required: true,
	})
	player_id: string;

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: ModelName.CLAN,
		required: false,
	})
	clan_id?: string;
}
