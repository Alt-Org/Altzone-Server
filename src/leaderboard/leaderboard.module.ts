import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { RedisModule } from '../common/service/redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerLeaderboardWinSchema } from './schemas/playerLeaderboardWin.schema';
import { PlayerLeaderboardWinService } from './playerLeaderboardWin.service';

@Module({
  imports: [
    PlayerModule,
    ClanModule,
    RedisModule,
    RequestHelperModule,
    MongooseModule.forFeature([
      {
        name: ModelName.PLAYER_LEADERBOARD_WIN,
        schema: PlayerLeaderboardWinSchema,
      },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PlayerLeaderboardWinService],
  exports: [PlayerLeaderboardWinService],
})
export class LeaderboardModule {}
