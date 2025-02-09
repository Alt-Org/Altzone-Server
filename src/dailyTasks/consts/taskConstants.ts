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
 */
export const TASK_CONSTS = {
	AMOUNT: {
		MIN: 2,
		MAX: 20,
	},
	POINTS: {
		MIN: 5,
		MAX: 100,
	},
	COINS: {
		FACTOR: 0.5, // Coins are calculated as points * FACTOR
	},
	TIME: 1000 * 60 // Time to complete the task in milliseconds.
};
