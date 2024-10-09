import { Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";


export class GameStatistics extends Document {
	@Prop({ type: Number, default: 0 })
	playedBattles: number;

	@Prop({ type: Number, default: 0 })
	wonBattles: number;

	@Prop({ type: Number, default: 0 })
	diamondsAmount: number;

	@Prop({ type: Number, default: 0 })
	startedVotings: number;

	@Prop({ type: Number, default: 0 })
	participatedVotings: number;
}
