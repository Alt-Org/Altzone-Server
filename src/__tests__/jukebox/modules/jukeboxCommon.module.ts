import { Test, TestingModule } from '@nestjs/testing';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from '../../../player/schemas/player.schema';
import { Clan, ClanSchema } from '../../../clan/clan.schema';
import { BullModule } from '@nestjs/bullmq';
import { ClanModule } from '../../../clan/clan.module';
import { EventEmitterCommonModule } from '../../../common/service/EventEmitterService/EventEmitterCommon.module';
import { JukeboxService } from '../../../jukebox/jukebox.service';
import { JukeboxProcessor, JukeboxQueue } from '../../../jukebox/jukebox.queue';
import JukeboxNotifier from '../../../jukebox/jukebox.notifier';

export default class JukeboxCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!JukeboxCommonModule.module) {
      JukeboxCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
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
        providers: [
          JukeboxService,
          JukeboxQueue,
          JukeboxNotifier,
          JukeboxProcessor,
        ],
      }).compile();
    }
    return JukeboxCommonModule.module;
  }
}
