import { Module } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { OnlinePlayersController } from './onlinePlayers.controller';
import { PlayerModule } from '../player/player.module';
import { RedisModule } from '../common/service/redis/redis.module';

@Module({
  imports: [PlayerModule, RedisModule],
  providers: [OnlinePlayersService],
  controllers: [OnlinePlayersController],
})
export class OnlinePlayersModule {}
