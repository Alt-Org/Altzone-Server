import { Module } from '@nestjs/common';
import { JukeboxService } from './jukebox.service';
import { JukeboxController } from './jukebox.controller';
import { EventEmitterCommonModule } from '../common/service/EventEmitterService/EventEmitterCommon.module';
import { JukeboxProcessor, JukeboxQueue } from './jukebox.queue';
import { BullModule } from '@nestjs/bullmq';
import { Player, PlayerSchema } from '../player/schemas/player.schema';
import { MongooseModule } from '@nestjs/mongoose';
import JukeboxNotifier from './jukebox.notifier';
import { Clan, ClanSchema } from '../clan/clan.schema';
import { ClanModule } from '../clan/clan.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Player.name, schema: PlayerSchema },
      { name: Clan.name, schema: ClanSchema },
    ]),
    BullModule.registerQueue({
      name: 'playlist',
    }),
    ClanModule,
    EventEmitterCommonModule,
  ],
  providers: [JukeboxService, JukeboxQueue, JukeboxNotifier, JukeboxProcessor],
  controllers: [JukeboxController],
})
export class JukeboxModule {}
