import { Injectable } from '@nestjs/common';
import { DailyTasksService } from '../dailyTasks/dailyTasks.service';
import { ClanRewarder } from '../rewarder/clanRewarder/clanRewarder.service';
import { OnGameEvent } from '../gameEventsEmitter/onGameEvent';
import UIDailyTasksService from '../dailyTasks/uiDailyTasks/uiDailyTasks.service';
import { GameEventPayload } from '../gameEventsEmitter/gameEvent';
import { IServiceReturn } from '../common/service/basicService/IService';
import { ClanEvent } from '../rewarder/clanRewarder/enum/ClanEvent.enum';
import { DailyTaskProgressService } from '../dailyTasks/dailyTaskProgress.service';

@Injectable()
export class ClanEventHandler {
  constructor(
    private readonly tasksService: DailyTasksService,
    private readonly uiTasksService: UIDailyTasksService,
    private readonly clanRewarder: ClanRewarder,
    private readonly progressService: DailyTaskProgressService,
  ) {}

  async handlePlayerTask(player_id: string): Promise<IServiceReturn<boolean>> {
    try {
      const [taskUpdate, errors] =
        await this.tasksService.updateTask(player_id);
      if (errors) return [null, errors];

      const [, progressErrors] =
        await this.progressService.handleProgress(taskUpdate);
      if (progressErrors) return [null, progressErrors];

      return [true, null];
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      e
    ) {
      return [true, null];
    }
  }

  /** Handles clan events
   * @param player_id player _id that triggered the event
   * @param event happened event
   * @returns true if handled successfully or ServiceErrors
   */
  async handleClanEvent(
    player_id: string,
    event: ClanEvent,
  ): Promise<IServiceReturn<boolean>> {
    return await this.clanRewarder.rewardForClanEvent(player_id, event);
  }

  /**
   * Handles side effects on new clan creation. These side effects are:
   *
   * - Creation of daily tasks for the clan
   *
   * @param event
   */
  @OnGameEvent('clan.create', { async: true })
  async handleClanCreation(event: GameEventPayload<'clan.create'>) {
    const clan_idStr = event.info.clan_id.toString();
    const [uiDailyTasks, errors] =
      this.uiTasksService.getUITasksForClan(clan_idStr);

    if (errors) throw errors;

    const [serverTasks] =
      this.tasksService.generateServerTasksForNewClan(clan_idStr);
    await this.tasksService.createMany([...serverTasks, ...uiDailyTasks]);
  }
}
