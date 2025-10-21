import mongoose from 'mongoose';
import JukeboxNotifier from '../../../jukebox/jukebox.notifier';
import { JukeboxProcessor, JukeboxQueue } from '../../../jukebox/jukebox.queue';
import { JukeboxService } from '../../../jukebox/jukebox.service';
import JukeboxCommonModule from './jukeboxCommon.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ClanSchema } from '../../../clan/clan.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';

export default class JukeboxModule {
  private constructor() {}

  static async getJukeboxService() {
    const module = await JukeboxCommonModule.getModule();
    return await module.resolve(JukeboxService);
  }

  static async getJukeboxNotifier() {
    const module = await JukeboxCommonModule.getModule();
    return await module.resolve(JukeboxNotifier);
  }

  static async getJukeboxProcessor() {
    const module = await JukeboxCommonModule.getModule();
    return await module.resolve(JukeboxProcessor);
  }

  static async getJukeboxQueue() {
    const module = await JukeboxCommonModule.getModule();
    return await module.resolve(JukeboxQueue);
  }

  static getClanModel() {
    return mongoose.model(ModelName.CLAN, ClanSchema);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }
}
