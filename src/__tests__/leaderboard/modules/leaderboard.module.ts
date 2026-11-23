import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import { RedisService } from '../../../common/service/redis/redis.service';
import LeaderboardCommonModule from './leaderboardCommon';

export default class LeaderboardModule {
  private constructor() {}

  static async getLeaderboardService() {
    const module = await LeaderboardCommonModule.getModule();
    const redis = module.get(RedisService);
    const cacheKeys = await redis.getKeys('leaderboards:*');
    await Promise.all(cacheKeys.map((key) => redis.delete(key)));
    return module.resolve(LeaderboardService);
  }
}
