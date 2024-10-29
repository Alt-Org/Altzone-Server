import { forwardRef, Module } from '@nestjs/common';
import { GameDataService } from './gameData.service';
import { GameDataController } from './gameData.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './game.schema';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { PlayerTasksModule } from '../playerTasks/playerTasks.module';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([ { name: Game.name, schema: GameSchema } ]),
    forwardRef(() => PlayerModule),
    forwardRef(() => ClanModule),
    forwardRef(() => ClanInventoryModule),
    forwardRef(() => PlayerTasksModule),
  ],
  providers: [GameDataService],
  controllers: [GameDataController]
})
export class GameDataModule {}
