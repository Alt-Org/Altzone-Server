import { TaskName } from "../enum/taskName.enum";

/**
 * Represents a task with its details.
 * 
 * @property clanId - The identifier for the clan this task belongs to.
 * @property playerId? - Optional id of the player who this task is assigned to.
 * @property title - The title of the task.
 * @property title.fi - The Finnish title of the task.
 * @property amount - The amount required to complete the task.
 * @property type - The type of the task.
 * @property coins - The number of coins rewarded for completing the task.
 * @property points - The number of points rewarded for completing the task.
 * @property startedAt? - Optional Date for the starting time.
 */
export type Task = {
	clanId: string;
	playerId?: string;
	title: {
		fi: string;
	};
	amount: number;
	type: TaskName;
	coins: number;
	points: number;
	startedAt?: Date;
}
