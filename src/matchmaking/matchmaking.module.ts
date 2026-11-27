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
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { MatchmakingRewardClaimSchema } from './schema/matchmakingRewardClaim.schema';
import { MatchmakingMatchHistorySchema } from './schema/matchmakingMatchHistory.schema';
import { BoxModule } from '../box/box.module';
import {
  PackageRaceBattleResult,
  PackageRaceBattleResultSchema,
} from '../box/packageRace/battle/packageRaceBattleResult.schema';
import { PackageRaceBattleRewarder } from '../box/packageRace/battle/packageRaceBattleRewarder.service';

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
    LeaderboardModule,
    BoxModule,
    MongooseModule.forFeature([
      {
        name: ModelName.MATCHMAKING_REWARD_CLAIM,
        schema: MatchmakingRewardClaimSchema,
      },
      {
        name: ModelName.MATCHMAKING_MATCH_HISTORY,
        schema: MatchmakingMatchHistorySchema,
      },
      {
        name: PackageRaceBattleResult.name,
        schema: PackageRaceBattleResultSchema,
      },
    ]),
    BullModule.registerQueue({ name: MATCHMAKING_QUEUE }),
  ],
  controllers: [MatchmakingController],
  providers: [
    MatchmakingService,
    MatchmakingNotifier,
    MatchmakingQueue,
    MatchmakingProcessor,
    PackageRaceBattleRewarder,
  ],
  exports: [MatchmakingService, MatchmakingNotifier, MatchmakingQueue],
})
export class MatchmakingModule {}
