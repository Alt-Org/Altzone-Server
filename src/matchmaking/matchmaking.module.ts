import { Module } from '@nestjs/common';
import { ClanModule } from '../clan/clan.module';
import { RedisModule } from '../common/service/redis/redis.module';
import { PlayerModule } from '../player/player.module';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingNotifier } from './matchmaking.notifier';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [RedisModule, PlayerModule, ClanModule],
  controllers: [MatchmakingController],
  providers: [MatchmakingService, MatchmakingNotifier],
  exports: [MatchmakingService, MatchmakingNotifier],
})
export class MatchmakingModule {}