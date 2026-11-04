/** The single final score target for each normal daily-task progression cycle. */
export const NORMAL_GAME_TARGET_POINTS = 2000;

/**
 * Temporary hard-coded prize pool
 */
export const prizePool = {
  maxPoints: NORMAL_GAME_TARGET_POINTS,
  milestones: [{ points: NORMAL_GAME_TARGET_POINTS }],
  finalRewards: [
    { id: 1, reward: 'Reward 1' },
    { id: 2, reward: 'Reward 2' },
    { id: 3, reward: 'Reward 3' },
  ],
};
