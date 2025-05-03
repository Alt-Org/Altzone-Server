import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { RedisModule } from '../common/service/redis/redis.module';

@Module({
  imports: [PlayerModule, ClanModule, RedisModule, RequestHelperModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
