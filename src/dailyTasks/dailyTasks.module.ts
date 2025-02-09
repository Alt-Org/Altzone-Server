import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RewarderModule } from "../rewarder/rewarder.module";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTasksService } from "./dailyTasks.service";
import { DailyTasksController } from "./dailyTasks.controller";
import { DailyTask, DailyTaskSchema } from "./dailyTasks.schema";
import { BullModule } from "@nestjs/bullmq";
import { DailyTaskProcessor, DailyTaskQueue } from "./dailyTask.queue";
import { PlayerModule } from "../player/player.module";
import { TaskGeneratorService } from "./taskGenerator.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: DailyTask.name, schema: DailyTaskSchema },
		]),
		BullModule.registerQueue({
			name: "daily-tasks",
		}),
		RewarderModule,
		PlayerModule,
	],
	providers: [DailyTasksService, TaskGeneratorService, DailyTaskNotifier, DailyTaskQueue, DailyTaskProcessor],
	controllers: [DailyTasksController],
	exports: [DailyTasksService],
})
export class DailyTasksModule {}
