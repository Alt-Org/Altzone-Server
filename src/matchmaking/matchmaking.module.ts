import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ClanModule } from '../clan/clan.module';
import { RedisModule } from '../common/service/redis/redis.module';
import { EventEmitterCommonModule } from '../common/service/EventEmitterService/EventEmitterCommon.module';
import { PlayerModule } from '../player/player.module';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingNotifier } from './matchmaking.notifier';
import {
  MATCHMAKING_QUEUE,
  MatchmakingProcessor,
  MatchmakingQueue,
} from './matchmaking.queue';
import { MatchmakingService } from './matchmaking.service';

/**
 * Wires the matchmaking feature together.
 *
 * Matchmaking stores transient invite, queue, and match state in Redis, reads
 * player and clan data through their modules, and uses BullMQ for delayed CLAN
 * opponent fallback jobs.
 */
@Module({
  imports: [
    RedisModule,
    PlayerModule,
    ClanModule,
    EventEmitterCommonModule,
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
