import { Module } from '@nestjs/common';
import { GameDataService } from './gameData.service';
import { GameDataController } from './gameData.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './game.schema';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { GameEventsHandlerModule } from '../gameEventsHandler/gameEventsHandler.module';
import { EventEmitterCommonModule } from '../common/service/EventEmitterService/EventEmitterCommon.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    PlayerModule,
    ClanModule,
    ClanInventoryModule,
    GameEventsHandlerModule,
    EventEmitterCommonModule
  ],
  providers: [GameDataService],
  controllers: [GameDataController],
})
export class GameDataModule {}
