import { Module } from '@nestjs/common';
import { GameDataService } from './gameData.service';
import { GameDataController } from './gameData.controller';

@Module({
  providers: [GameDataService],
  controllers: [GameDataController]
})
export class GameDataModule {}
