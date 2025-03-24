import mongoose from 'mongoose';
import ClanCommonModule from './clanCommon';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ClanSchema } from '../../../clan/clan.schema';
import { ClanService } from '../../../clan/clan.service';
import { PlayerCounterFactory } from '../../../clan/clan.counters';
import ClanHelperService from '../../../clan/utils/clanHelper.service';
import { JoinService } from '../../../clan/join/join.service';
import { isClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';
import { joinSchema } from '../../../clan/join/join.schema';

export default class ClanModule {
  private constructor() {}

  static async getClanService() {
    const module = await ClanCommonModule.getModule();
    return await module.resolve(ClanService);
  }

  static async getPlayerCounterFactory() {
    const module = await ClanCommonModule.getModule();
    return await module.resolve(PlayerCounterFactory);
  }

  static async getClanHelperService() {
    const module = await ClanCommonModule.getModule();
    return await module.resolve(ClanHelperService);
  }

  static getClanModel() {
    return mongoose.model(ModelName.CLAN, ClanSchema);
  }

  static async getJoinService() {
    const module = await ClanCommonModule.getModule();
    return await module.resolve(JoinService);
  }

  static getJoinModel() {
    return mongoose.model(ModelName.JOIN, joinSchema);
  }

  static async getIsClanExist() {
    const module = await ClanCommonModule.getModule();
    return await module.resolve(isClanExists);
  }
}
