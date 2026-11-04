import { DailyTaskDto } from '../dto/dailyTask.dto';

export type DailyTaskProgressStatus = 'advanced' | 'completed';

export type DailyTaskProgressResult<TTask = DailyTaskDto> = {
  status: DailyTaskProgressStatus;
  task: TTask;
  completedByPlayerId: string;
  clanId: string;
  completedAmount: number;
  previousAmountLeft: number;
  currentAmountLeft: number;
  /** Newly reached active clan milestone, including a Box-session target. */
  reachedMilestones?: number[];
  needsClanReward?: boolean;
};
