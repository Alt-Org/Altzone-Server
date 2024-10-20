import { forwardRef, Module } from "@nestjs/common";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";
import { PlayerModule } from "../player/player.module";
import { ClanModule } from "../clan/clan.module";
import { RequestHelperModule } from "../requestHelper/requestHelper.module";

@Module({
	imports: [forwardRef(() => PlayerModule), forwardRef(() => ClanModule), RequestHelperModule],
	controllers: [LeaderboardController],
	providers: [LeaderboardService],
})
export class LeaderboardModule {}
