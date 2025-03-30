import { Module } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { OnlinePlayersController } from './onlinePlayers.controller';

@Module({
  providers: [OnlinePlayersService],
  controllers: [OnlinePlayersController],
})
export class OnlinePlayersModule {}
