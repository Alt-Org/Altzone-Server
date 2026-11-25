import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Clan } from '../../../clan/clan.schema';
import { Box } from '../../schemas/box.schema';
import { IServiceReturn } from '../../../common/service/basicService/IService';
import { convertMongooseToServiceErrors } from '../../../common/service/basicService/BasicService';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import { ClanProgression } from '../../../rewarder/clanProgression/clanProgression.service';
import isTestingSession from '../../util/isTestingSession';
import { BOX_SESSION_TASK_POINTS } from '../../consts/boxSessionConstants';
import { PackageRaceStatus } from '../enum/packageRaceStatus.enum';
import { SessionTaskCompletion } from './sessionTaskCompletion.schema';
import {
  SessionTaskReward,
  SessionTaskRewardSkipReason,
} from './sessionTaskReward.type';

/**
 * Data of a completed session task needed to reward the session team.
 */
export type CompletedSessionTask = {
  teamId: string;
  completedByPlayerId: string;
  task: {
    _id?: unknown;
    type: string;
    coins: number;
  };
};

@Injectable()
export class SessionTaskRewarder {
  constructor(
    @InjectModel(Clan.name) private readonly clanModel: Model<Clan>,
    @InjectModel(Box.name) private readonly boxModel: Model<Box>,
    @InjectModel(SessionTaskCompletion.name)
    private readonly completionModel: Model<SessionTaskCompletion>,
    private readonly clanRewarder: ClanRewarder,
    private readonly clanProgression: ClanProgression,
  ) {}

  /**
   * Gives the session team package-race points for a completed session task.
   *
   * @param completed the completed task, its team and the player who completed it
   * @param session the transaction session of the task completion
   *
   * @returns
   * - null if the task is not a session task (the API is not in TESTING_SESSION
   *   or the clan does not belong to a box).
   * - SessionTaskReward when the task is a session task.
   * - ServiceErrors if any occurred.
   */
  async rewardTeam(
    completed: CompletedSessionTask,
    session: ClientSession,
  ): Promise<IServiceReturn<SessionTaskReward | null>> {
    if (!isTestingSession()) return [null, null];

    try {
      const clan = await this.clanModel
        .findById(completed.teamId, { box_id: 1 }, { session })
        .lean<{ box_id?: string | null }>()
        .exec();
      const boxId = clan?.box_id?.toString();
      if (!boxId) return [null, null];

      const reward: SessionTaskReward = {
        boxId,
        teamId: completed.teamId.toString(),
        completedByPlayerId: completed.completedByPlayerId.toString(),
        taskType: completed.task.type,
        points: 0,
        awarded: false,
        reachedMilestones: [],
      };

      const isRaceActive = await this.isTeamInActiveRace(
        boxId,
        reward.teamId,
        session,
      );
      if (!isRaceActive)
        return [this.skipReward(reward, 'RACE_NOT_ACTIVE'), null];

      const isFirstCompletion = await this.recordCompletion(
        reward,
        completed.task._id,
        session,
      );
      if (!isFirstCompletion)
        return [this.skipReward(reward, 'ALREADY_COMPLETED'), null];

      const [updatedClan, rewardErrors] =
        await this.clanRewarder.rewardClanForPlayerTask(
          reward.teamId,
          BOX_SESSION_TASK_POINTS,
          completed.task.coins ?? 0,
          session,
        );
      if (rewardErrors) return [null, rewardErrors];

      const [progression, progressionErrors] =
        await this.clanProgression.handleClanProgression(updatedClan, session);
      if (progressionErrors) return [null, progressionErrors];

      reward.points = BOX_SESSION_TASK_POINTS;
      reward.awarded = true;
      reward.reachedMilestones = progression.reachedMilestones;

      return [reward, null];
    } catch (error) {
      return [null, convertMongooseToServiceErrors(error)];
    }
  }

  /**
   * Checks that the box has an ACTIVE package race and the team takes part in it.
   *
   * @param boxId _id of the specified Box
   * @param teamId _id of the specified package race team
   * @param session the transaction session of the task completion
   *
   * @returns true if the session has an active package race and the team takes part in it.
   */
  private async isTeamInActiveRace(
    boxId: string,
    teamId: string,
    session: ClientSession,
  ): Promise<boolean> {
    const box = await this.boxModel
      .findById(boxId, { packageRace: 1 }, { session })
      .lean<Pick<Box, 'packageRace'>>()
      .exec();
    const race = box?.packageRace;
    if (!race || race.status !== PackageRaceStatus.ACTIVE) return false;

    return (race.teams ?? []).some(
      (team) => team.team_id.toString() === teamId,
    );
  }

  /**
   * Records the completion of the task type by the player.
   *
   * @param reward session task reward data
   * @param task_id _id of the specified session task
   * @param session the transaction session of the task completion
   *
   * @returns true if this is the player's first completion of the task type
   */
  private async recordCompletion(
    reward: SessionTaskReward,
    task_id: unknown,
    session: ClientSession,
  ): Promise<boolean> {
    const result = await this.completionModel.updateOne(
      {
        box_id: reward.boxId,
        player_id: reward.completedByPlayerId,
        taskType: reward.taskType,
      },
      {
        $setOnInsert: {
          team_id: reward.teamId,
          task_id: task_id ? task_id.toString() : null,
          points: BOX_SESSION_TASK_POINTS,
        },
      },
      { upsert: true, session },
    );

    return result.upsertedCount === 1;
  }

  /**
   * Skips completed task reward (don't give points)
   *
   * @param reward session task reward data
   * @param skipReason reason why the team is not awarded points
   *
   * @returns SessionTaskReward data and reason why task reward was skipped
   */
  private skipReward(
    reward: SessionTaskReward,
    skipReason: SessionTaskRewardSkipReason,
  ): SessionTaskReward {
    return { ...reward, skipReason };
  }
}
