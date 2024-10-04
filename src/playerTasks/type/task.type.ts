import { TaskName } from "../enum/taskName.enum";

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

export type PlayerTasks = {
	monday: Task[];
	tuesday: Task[];
	wednesday: Task[];
	friday: Task[];
	saturday: Task[];
	sunday: Task[];
	weekly: Task[];
	monthly: Task[];
}