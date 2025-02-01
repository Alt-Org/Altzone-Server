import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RewarderModule } from "../rewarder/rewarder.module";
import { PlayerModule } from "../player/player.module";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTasksService } from "./dailyTasks.service";
import { DailyTasksController } from "./dailyTasks.controller";
import { DailyTask, DailyTaskSchema } from "./dailyTasks.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: DailyTask.name, schema: DailyTaskSchema },
		]),
		RewarderModule,
		PlayerModule,
	],
	providers: [DailyTasksService, DailyTaskNotifier],
	controllers: [DailyTasksController],
	exports: [DailyTasksService],
})
export class DailyTasksModule {}
