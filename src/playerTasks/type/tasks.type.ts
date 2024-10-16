import { Task } from "./task.type";

/**
 * Represents the tasks that players can complete.
 * Loaded from playerTasks.json
 * This type needs to updated if the structure of the JSON file changes.
 * 
 * @property monday - The tasks assigned for Monday.
 * @property tuesday - The tasks assigned for Tuesday.
 * @property wednesday - The tasks assigned for Wednesday.
 * @property friday - The tasks assigned for Friday.
 * @property saturday - The tasks assigned for Saturday.
 * @property sunday - The tasks assigned for Sunday.
 * @property weekly - The tasks assigned for the week.
 * @property monthly - The tasks assigned for the month.
 */
export type PlayerTasks = {
	monday: Task[];
	tuesday: Task[];
	wednesday: Task[];
	thursday: Task[];
	friday: Task[];
	saturday: Task[];
	sunday: Task[];
	weekly: Task[];
	monthly: Task[];
}
