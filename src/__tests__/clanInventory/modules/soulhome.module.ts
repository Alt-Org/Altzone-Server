import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { SoulHomeService } from '../../../clanInventory/soulhome/soulhome.service';
import SoulHomeHelperService from '../../../clanInventory/soulhome/utils/soulHomeHelper.service';
import { SoulhomeSchema } from '../../../clanInventory/soulhome/soulhome.schema';
import ClanInventoryCommonModule from './clanInventoryCommon';

export default class SoulhomeModule {
  private constructor() {}

  static async getSoulHomeService() {
    const module = await ClanInventoryCommonModule.getModule();
    return await module.resolve(SoulHomeService);
  }

  static async getSoulHomeHelperService() {
    const module = await ClanInventoryCommonModule.getModule();
    return await module.resolve(SoulHomeHelperService);
  }

  static getSoulhomeModel() {
    return mongoose.model(ModelName.SOULHOME, SoulhomeSchema);
  }
}
