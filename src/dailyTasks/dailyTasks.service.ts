import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import BasicService from "../common/service/basicService/BasicService";
import { ModelName } from "../common/enum/modelName.enum";
import DailyTaskNotifier from "./dailyTask.notifier";
import { DailyTask } from "./dailyTasks.schema";

@Injectable()
export class DailyTasksService {
	public constructor(
		@InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
		private readonly notifier: DailyTaskNotifier
	) {
		this.basicService = new BasicService(model);
		this.modelName = ModelName.DAILY_TASK;
		this.refsInModel = [ModelName.PLAYER];
	}
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;
	public readonly refsInModel: ModelName[];
}
