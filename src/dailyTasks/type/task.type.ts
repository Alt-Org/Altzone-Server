import { ServerTaskName } from "../enum/serverTaskName.enum";
import {TaskTitle} from "./taskTitle.type";

/**
 * Represents a task with its details.
 * 
 * @property clan_id - The identifier for the clan this task belongs to.
 * @property player_id? - Optional id of the player who this task is assigned to.
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
	clan_id: string,
	player_id: string,
	type: ServerTaskName,
	title: TaskTitle,
	amount: number;
	amountLeft: number;
	points: number;
	coins: number;
	startedAt: Date;
	timeLimitMinutes: number;
}
