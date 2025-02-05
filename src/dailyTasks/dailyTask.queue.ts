import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { TASK_CONSTS } from "./consts/taskConstants";
import { DailyTasksService } from "./dailyTasks.service";
import { Job } from "bullmq";
import { DailyTaskDto } from "./dto/dailyTask.dto";
import { Queue } from "bull";

@Injectable()
export class DailyTaskQueue {
	constructor(
		@InjectQueue("daily-tasks") private readonly dailyTaskQueue: Queue
	) {}

	async addDailyTask(task: DailyTaskDto) {
		if (!task.playerId || !task.startedAt) return;
		const delay = TASK_CONSTS.TIME * task.timeLimitMinutes; // convert minutes to ms
		await this.dailyTaskQueue.add("tasks", task, { delay });
	}
}

@Processor("daily-tasks")
export class DailyTaskProcessor extends WorkerHost {
	constructor(
		@Inject(forwardRef(() => DailyTasksService))
		private readonly dailyTasksService: DailyTasksService
	) {
		super();
	}

	async process(job: Job): Promise<any> {
		await this.dailyTasksService.handleExpiredTask(job.data);
	}
}
