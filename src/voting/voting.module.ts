import { Module } from "@nestjs/common";
import { Voting, VotingSchema } from "./schemas/voting.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { VotingService } from "./schemas/voting.service";
import VotingNotifier from "./voting.notifier";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Voting.name, schema: VotingSchema }]),
	],
	providers: [VotingService, VotingNotifier],
	controllers: [],
	exports: [VotingService],
})
export class VotingModule {}
