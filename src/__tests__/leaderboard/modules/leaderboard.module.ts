import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import LeaderboardCommonModule from './leaderboardCommon';

export default class LeaderboardModule {
  private constructor() {}

  static async getLeaderboardService() {
    const module = await LeaderboardCommonModule.getModule();
    return module.resolve(LeaderboardService);
  }
}
