import { Module } from "@nestjs/common";
import { Voting, VotingSchema } from "./voting.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { VotingService } from "./voting.service";
import VotingNotifier from "./voting.notifier";
import { Vote } from "./vote.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Voting.name, schema: VotingSchema },
		]),
	],
	providers: [VotingService, VotingNotifier],
	controllers: [],
	exports: [VotingService],
})
export class VotingModule {}
