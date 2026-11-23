/**
 * Why a session task completion did not give the team package-race points.
 *
 * - ALREADY_COMPLETED: the player has already earned points for this task type
 * - RACE_NOT_ACTIVE: the package race has ended or the team is not in the race
 */
export type SessionTaskRewardSkipReason =
  | 'ALREADY_COMPLETED'
  | 'RACE_NOT_ACTIVE';

/**
 * Result of handling a completed session task in a box testing session.
 */
export type SessionTaskReward = {
  boxId: string;
  teamId: string;
  completedByPlayerId: string;
  taskType: string;
  points: number;
  awarded: boolean;
  skipReason?: SessionTaskRewardSkipReason;
  reachedMilestones: number[];
};

/**
 * Emitted after the transaction that awarded session task points has committed.
 * Payload: SessionTaskReward with awarded = true.
 */
export const SESSION_TASK_POINTS_AWARDED_EVENT =
  'packageRace.sessionTaskPointsAwarded';
