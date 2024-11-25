import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { Player } from "../player/player.schema";
import { VotingType } from "./enum/VotingType.enum";
import { Vote } from "./vote.schema";

export type VotingDocument = HydratedDocument<Voting>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Voting {
	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: ModelName.PLAYER,
		required: true,
	})
	organizer_id: string;

	@Prop({ type: Date })
	endedAt: Date;

	@Prop({ type: Date, default: Date.now })
	startedAt: Date;

	@Prop({ type: Date })
	endsOn: Date;

	@Prop({ type: String, enum: VotingType, required: true })
	type: VotingType;

	@Prop({
		type: [MongooseSchema.Types.ObjectId],
		ref: ModelName.PLAYER,
		required: true,
	})
	player_ids: string[];

	@Prop({ type: Number, default: 51 })
	minPercentage: number;

	@Prop({ type: [Vote], default: [] })
	votes: Vote[];

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: ModelName.ITEM,
		required: true,
	})
	item_id?: string;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
VotingSchema.set("collection", ModelName.VOTING);
VotingSchema.virtual(ModelName.PLAYER, {
	ref: ModelName.PLAYER,
	localField: "organizer_id",
	foreignField: "_id",
	justOne: true,
});

VotingSchema.pre("save", function (next) {
	if (
		(this.type === VotingType.BUYING_ITEM ||
			this.type === VotingType.SELLING_ITEM) &&
		!this.item_id
	) {
		return next(
			new Error(
				"item_id is required for SELLING_ITEM and BUYING_ITEM voting types"
			)
		);
	}
	next();
});
