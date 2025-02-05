import { TaskName } from "../enum/taskName.enum";

/**
 * Represents a task with its details.
 * 
 * @property clanId - The identifier for the clan this task belongs to.
 * @property playerId? - Optional id of the player who this task is assigned to.
 * @property title - The title of the task.
 * @property amount - The amount required to complete the task.
 * @property type - The type of the task.
 * @property coins - The number of coins rewarded for completing the task.
 * @property points - The number of points rewarded for completing the task.
 * @property startedAt? - Optional Date for the starting time.
 * @property timeLimitMinutes - Time limit to complete the task in.
 */
export type Task = {
	_id: string,
	clanId: string,
	playerId: string,
	type: TaskName,
	title: string,
	amount: number;
	amountLeft: number;
	points: number;
	coins: number;
	startedAt: Date;
	timeLimitMinutes: number;
}
