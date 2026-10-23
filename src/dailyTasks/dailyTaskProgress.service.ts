import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { IServiceReturn } from '../common/service/basicService/IService';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../common/function/Transactions';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import { ClanProgression } from '../rewarder/clanProgression/clanProgression.service';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import DailyTaskNotifier from './dailyTask.notifier';
import { DailyTaskDto } from './dto/dailyTask.dto';
import { DailyTaskProgressResult } from './type/dailyTaskProgressResult.type';

type ProgressTask = Pick<
  DailyTaskDto,
  'clan_id' | 'player_id' | 'points' | 'coins' | 'type'
>;

@Injectable()
export class DailyTaskProgressService {
  constructor(
    private readonly notifier: DailyTaskNotifier,
    private readonly clanRewarder: ClanRewarder,
    private readonly playerRewarder: PlayerRewarder,
    private readonly clanProgression: ClanProgression,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async handleProgress<TTask extends ProgressTask>(
    result: DailyTaskProgressResult<TTask>,
    session?: ClientSession,
  ): Promise<IServiceReturn<DailyTaskProgressResult<TTask>>> {
    if (result.status === 'advanced') {
      this.notifier.taskUpdated(result.completedByPlayerId, result.task);
      return [result, null];
    }

    if (session) return this.handleCompletion(result, session);

    const [newSession, initErrors] = await initializeSession(this.connection);
    if (!newSession) return [null, initErrors];

    const [handledResult, errors] = await this.handleCompletion(
      result,
      newSession,
    );
    if (errors) return cancelTransaction(newSession, errors);

    return endTransaction(newSession, handledResult);
  }

  /**
   * Completes a clan-level task without rewarding the acting player.
   */
  async handleClanTaskCompletion<TTask extends ProgressTask>(
    result: DailyTaskProgressResult<TTask>,
    session?: ClientSession,
    notify = true,
  ): Promise<IServiceReturn<DailyTaskProgressResult<TTask>>> {
    if (session) return this.handleClanCompletion(result, session, notify);

    const [newSession, initErrors] = await initializeSession(this.connection);
    if (!newSession) return [null, initErrors];

    const [handledResult, errors] = await this.handleClanCompletion(
      result,
      newSession,
      notify,
    );
    if (errors) return cancelTransaction(newSession, errors);

    return endTransaction(newSession, handledResult);
  }

  private async handleCompletion<TTask extends ProgressTask>(
    result: DailyTaskProgressResult<TTask>,
    session: ClientSession,
  ): Promise<IServiceReturn<DailyTaskProgressResult<TTask>>> {
    const { task } = result;

    const [, playerRewardErrors] =
      await this.playerRewarder.rewardForPlayerTask(
        result.completedByPlayerId,
        task.points,
        session,
      );
    if (playerRewardErrors) return [null, playerRewardErrors];

    this.notifier.taskCompleted(result.completedByPlayerId, task);

    if (result.needsClanReward === false) {
      return [result, null];
    }

    const [updatedClan, clanRewardErrors] =
      await this.clanRewarder.rewardClanForPlayerTask(
        result.clanId,
        task.points,
        task.coins,
        session,
      );
    if (clanRewardErrors) return [null, clanRewardErrors];

    const [progressionResult, clanProgressionErrors] =
      await this.clanProgression.handleClanProgression(updatedClan, session);
    if (clanProgressionErrors) return [null, clanProgressionErrors];

    result.reachedMilestones = progressionResult.reachedMilestones;

    this.notifier.taskCompletedForClan(
      result.clanId,
      task,
      result.completedByPlayerId,
    );

    if (result.reachedMilestones?.length) {
      this.notifier.milestoneReached(
        result.clanId,
        task,
        result.completedByPlayerId,
        result.reachedMilestones,
      );
    }

    return [result, null];
  }

  private async handleClanCompletion<TTask extends ProgressTask>(
    result: DailyTaskProgressResult<TTask>,
    session: ClientSession,
    notify: boolean,
  ): Promise<IServiceReturn<DailyTaskProgressResult<TTask>>> {
    const { task } = result;

    const [updatedClan, clanRewardErrors] =
      await this.clanRewarder.rewardClanForPlayerTask(
        result.clanId,
        task.points,
        task.coins,
        session,
      );
    if (clanRewardErrors) return [null, clanRewardErrors];

    const [progressionResult, clanProgressionErrors] =
      await this.clanProgression.handleClanProgression(updatedClan, session);
    if (clanProgressionErrors) return [null, clanProgressionErrors];

    result.reachedMilestones = progressionResult.reachedMilestones;

    if (notify) this.notifyClanTaskCompletion(result);

    return [result, null];
  }

  /**
   * Publishes clan-task notifications after the transaction containing the
   * task and reward changes has committed.
   */
  notifyClanTaskCompletion<TTask extends ProgressTask>(
    result: DailyTaskProgressResult<TTask>,
  ) {
    this.notifier.taskCompletedForClan(
      result.clanId,
      result.task,
      result.completedByPlayerId,
    );

    if (result.reachedMilestones?.length) {
      this.notifier.milestoneReached(
        result.clanId,
        result.task,
        result.completedByPlayerId,
        result.reachedMilestones,
      );
    }
  }
}
