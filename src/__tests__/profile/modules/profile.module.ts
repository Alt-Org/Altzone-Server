import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ProfileSchema } from '../../../profile/profile.schema';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import { isProfileExists } from '../../../profile/decorator/validation/IsProfileExists.decorator';
import { isUsernameExists } from '../../../profile/decorator/validation/IsUsernameExists.decorator';
import { ProfileService } from '../../../profile/profile.service';
import { PlayerService } from '../../../player/player.service';
import ProfileCommonModule from './profileCommon.module';

export default class ProfileModule {
  private constructor() {}

  static async getProfileService() {
    const module = await ProfileCommonModule.getModule();
    return await module.resolve(ProfileService);
  }

  static async getPlayerService() {
    const module = await ProfileCommonModule.getModule();
    return await module.resolve(PlayerService);
  }

  static async getIsUsernameExists() {
    const module = await ProfileCommonModule.getModule();
    return await module.resolve(isUsernameExists);
  }

  static async getIsProfileExists() {
    const module = await ProfileCommonModule.getModule();
    return await module.resolve(isProfileExists);
  }

  static getProfileModel() {
    return mongoose.model(ModelName.PROFILE, ProfileSchema);
  }

  static getPlayerModel() {
    return mongoose.model(ModelName.PLAYER, PlayerSchema);
  }
}
