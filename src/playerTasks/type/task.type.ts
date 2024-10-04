import { TaskName } from "../enum/taskName.enum";

/**
 * Represents a task with its details.
 * 
 * @property id - The unique identifier for the task.
 * @property title - The title of the task.
 * @property title.fi - The Finnish title of the task.
 * @property content - The content/description of the task.
 * @property content.fi - The Finnish content/description of the task.
 * @property amount - The amount required to complete the task.
 * @property type - The type of the task.
 * @property coins - The number of coins rewarded for completing the task.
 * @property points - The number of points rewarded for completing the task.
 */
export type Task = {
	id: number;
	title: {
		fi: string;
	};
	content: {
		fi: string;
	};
	amount: number;
	type: TaskName;
	coins: number;
	points: number;
}
