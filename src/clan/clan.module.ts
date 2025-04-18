import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClanSchema } from './clan.schema';
import { ClanController } from './clan.controller';
import { ClanService } from './clan.service';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { isClanExists } from './decorator/validation/IsClanExists.decorator';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerCounterFactory } from './clan.counters';
import { joinSchema } from './join/join.schema';
import { JoinService } from './join/join.service';
import ClanHelperService from './utils/clanHelper.service';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanInventoryModule } from '../clanInventory/clanInventory.module';
import { PlayerModule } from '../player/player.module';
import { GameEventsEmitterModule } from '../gameEventsEmitter/gameEventsEmitter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.CLAN, schema: ClanSchema },
      { name: ModelName.JOIN, schema: joinSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
    ]),
    ClanInventoryModule,
    RequestHelperModule,
    PlayerModule,
    GameEventsEmitterModule,
  ],
  controllers: [ClanController],
  providers: [
    ClanService,
    isClanExists,
    PlayerCounterFactory,
    JoinService,
    ClanHelperService,
  ],
  exports: [ClanService, PlayerCounterFactory],
})
export class ClanModule {}
