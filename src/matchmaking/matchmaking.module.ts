import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ClanModule } from '../clan/clan.module';
import { RedisModule } from '../common/service/redis/redis.module';
import { PlayerModule } from '../player/player.module';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingNotifier } from './matchmaking.notifier';
import {
  MATCHMAKING_QUEUE,
  MatchmakingProcessor,
  MatchmakingQueue,
} from './matchmaking.queue';
import { MatchmakingService } from './matchmaking.service';

@Module({
  imports: [
    RedisModule,
    PlayerModule,
    ClanModule,
    BullModule.registerQueue({ name: MATCHMAKING_QUEUE }),
  ],
  controllers: [MatchmakingController],
  providers: [
    MatchmakingService,
    MatchmakingNotifier,
    MatchmakingQueue,
    MatchmakingProcessor,
  ],
  exports: [MatchmakingService, MatchmakingNotifier, MatchmakingQueue],
})
export class MatchmakingModule {}
