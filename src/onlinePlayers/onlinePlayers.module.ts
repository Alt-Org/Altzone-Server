import { Module } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { OnlinePlayersController } from './onlinePlayers.controller';
import { PlayerModule } from '../player/player.module';
import { RedisModule } from '../common/service/redis/redis.module';
import { BattleQueueService } from './battleQueue/battleQueue.service';
import { BattleQueueController } from './battleQueue/battleQueue.controller';

@Module({
  imports: [PlayerModule, RedisModule],
  providers: [OnlinePlayersService, BattleQueueService],
  controllers: [OnlinePlayersController, BattleQueueController],
  exports: [OnlinePlayersService],
})
export class OnlinePlayersModule {}
