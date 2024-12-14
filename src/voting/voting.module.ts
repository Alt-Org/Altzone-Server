import { Module } from "@nestjs/common";
import { Voting, VotingSchema } from "./schemas/voting.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { VotingController } from './voting.controller';
import VotingNotifier from "./voting.notifier";
import { VotingService } from "./voting.service";
import { PlayerModule } from "../player/player.module";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Voting.name, schema: VotingSchema }]),
		PlayerModule
	],
	providers: [VotingService, VotingNotifier],
	controllers: [VotingController],
	exports: [VotingService],
})
export class VotingModule {}
