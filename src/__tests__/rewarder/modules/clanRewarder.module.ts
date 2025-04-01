import RewarderCommonModule from './rewarderCommon';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { PlayerRewarder } from '../../../rewarder/playerRewarder/playerRewarder.service';

export default class RewarderModule {
  private constructor() {}

  static async getClanRewarder() {
    const module = await RewarderCommonModule.getModule();
    return module.resolve(ClanRewarder);
  }

  static async getPlayerRewarder() {
    const module = await RewarderCommonModule.getModule();
    return module.resolve(PlayerRewarder);
  }
}
