import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Clan } from '../../clan/clan.schema';
import { convertMongooseToServiceErrors } from '../../common/service/basicService/BasicService';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { NORMAL_GAME_TARGET_POINTS } from '../const/prizePool';

export type ClanProgressionResult = {
  /**
   * Contains the final target when it was reached for the first time.
   * The array shape is retained for compatibility with the MQTT contract.
   */
  reachedMilestones: number[];
};

@Injectable()
export class ClanProgression {
  constructor(
    @InjectModel(Clan.name)
    private readonly clanModel: Model<Clan>,
  ) {}

  /**
   * Checks whether a clan has reached its single final score target and, if
   * so, records it once. Regular clans target 2000 points, while Box-session
   * clans use the targetPoints value assigned when the session starts.
   *
   * The optional MongoDB session keeps the milestone update in the same
   * transaction as the task completion and clan point update.
   */
  async handleClanProgression(
    clan: Clan,
    session?: ClientSession,
  ): Promise<IServiceReturn<ClanProgressionResult>> {
    const targetPoints = this.getTargetPoints(clan);

    return this.recordTargetReached(clan._id, targetPoints, session);
  }

  /**
   * Resolves the clan's only active milestone. A stored targetPoints value
   * identifies the session-specific Box target; otherwise the normal game's
   * final target is used.
   */
  private getTargetPoints(clan: Clan): number {
    return clan.targetPoints ?? NORMAL_GAME_TARGET_POINTS;
  }

  /**
   * Atomically records the final target if the persisted clan has enough
   * points and the target has not already been recorded. The conditional
   * update prevents concurrent task completions from reporting the same
   * milestone more than once.
   */
  private async recordTargetReached(
    clanId: string,
    targetPoints: number,
    session?: ClientSession,
  ): Promise<IServiceReturn<ClanProgressionResult>> {
    try {
      const result = await this.clanModel.updateOne(
        {
          _id: clanId,
          points: { $gte: targetPoints },
          unlockedMilestones: { $ne: targetPoints },
        },
        {
          $addToSet: {
            unlockedMilestones: targetPoints,
          },
        },
        { session },
      );

      if (result.modifiedCount === 0) {
        return this.noMilestoneReached();
      }

      return [{ reachedMilestones: [targetPoints] }, null];
    } catch (error) {
      return [null, convertMongooseToServiceErrors(error)];
    }
  }

  /**
   * Returns the common empty result when the target has not been reached or
   * another concurrent operation has already recorded it.
   */
  private noMilestoneReached(): IServiceReturn<ClanProgressionResult> {
    return [{ reachedMilestones: [] }, null];
  }
}
