import { Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { Prop } from "@nestjs/mongoose";
import { Choice, ItemVoteChoice } from "./enum/choiceType.enum";

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
		validate: {
			validator: function (value: any) {
				const validChoices = [...Object.values(ItemVoteChoice)];
				return validChoices.includes(value);
			},
			message: (props) => `${props.value} is not a valid choice`,
		},
	})
	choice: Choice;
}
