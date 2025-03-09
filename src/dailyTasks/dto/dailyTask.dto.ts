import { Expose } from "class-transformer";
import { ExtractField } from "../../common/decorator/response/ExtractField";
import { TaskName } from "../enum/taskName.enum";
import AddType from "../../common/base/decorator/AddType.decorator";
import {TaskTitle} from "../type/taskTitle.type";

@AddType("DailyTaskDto")
export class DailyTaskDto {
	@ExtractField()
	@Expose()
	_id: string;

	@ExtractField()
	@Expose()
	clan_id: string;

	@ExtractField()
	@Expose()
	player_id: string;

	@Expose()
	title: TaskTitle;

	@Expose()
	type: TaskName;

	@Expose()
	points: number;

	@Expose()
	coins: number;

	@Expose()
	startedAt: Date;

	@Expose()
	amount: number;

	@Expose()
	amountLeft: number;

	@Expose()
	timeLimitMinutes: number;
}
