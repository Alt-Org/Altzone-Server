/**
 * @constant
 * @name TASK_CONSTS
 * @description
 * This constant contains configuration values for daily tasks.
 * It includes the minimum and maximum amounts, points, and a factor for calculating coins.
 * Additionally, it specifies the time to complete the task in milliseconds.
 * Adjust these values to modify the random values and related parameters for tasks.
 *
 * @property AMOUNT - The range for the amount of tasks.
 * @property AMOUNT.MIN - The minimum amount of tasks.
 * @property AMOUNT.MAX - The maximum amount of tasks.
 *
 * @property POINTS - The range for the points awarded for tasks.
 * @property POINTS.MIN - The minimum points awarded.
 * @property POINTS.MAX - The maximum points awarded.
 *
 * @property COINS - The factor for calculating coins from points.
 * @property COINS.FACTOR - The factor used to calculate coins (points * FACTOR).
 *
 * @property TIME - The time to complete the task in milliseconds.
 * 
 * @property DAILY_TASK - Points configuration for daily tasks.
 * @property DAILY_TASK.SMALL - Points awarded for small daily tasks.
 * @property DAILY_TASK.MEDIUM - Points awarded for medium daily tasks (reserved for future use).
 * @property DAILY_TASK.BIG - Points awarded for big daily tasks (reserved for future use).
 * @property DAILY_TASK.CANCEL_PENALTY - Points deducted for canceling a daily task.
 *
 * @property BATTLE - Points configuration for battle tasks.
 * @property BATTLE.RANDOM_PAIR - Points configuration for random pair battles.
 * @property BATTLE.RANDOM_PAIR.WIN - Points awarded for winning a random pair battle.
 * @property BATTLE.RANDOM_PAIR.LOSS - Points deducted for losing a random pair battle.
 * @property BATTLE.CLAN_PAIR - Points configuration for clan pair battles.
 * @property BATTLE.CLAN_PAIR.WIN - Points awarded for winning a clan pair battle.
 * @property BATTLE.CLAN_PAIR.LOSS - Points deducted for losing a clan pair battle.
 *
 */
export const TASK_CONSTS = {
  AMOUNT: {
    MIN: 2,
    MAX: 20,
  },
  POINTS: {
    DAILY_TASK: {
      SMALL: 20,
      MEDIUM: 0, // Reserved for future use
      BIG: 0, // Reserved for future use
      CANCEL_PENALTY: 10,
    },
    BATTLE: {
      RANDOM_PAIR: {
        WIN: 30,
        LOSS: -20,
      },
      CLAN_PAIR: {
        WIN: 40,
        LOSS: -25,
      },
    },
  },
  COINS: {
    FACTOR: 0.5,
  },
  TIME: 1000 * 60,
};
