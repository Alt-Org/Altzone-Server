import { Module } from '@nestjs/common';
import { OnlinePlayersService } from './onlinePlayers.service';
import { OnlinePlayersController } from './onlinePlayers.controller';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [PlayerModule],
  providers: [OnlinePlayersService],
  controllers: [OnlinePlayersController],
})
export class OnlinePlayersModule {}
