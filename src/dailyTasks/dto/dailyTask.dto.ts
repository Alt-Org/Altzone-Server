import { Expose } from "class-transformer";
import { ExtractField } from "../../common/decorator/response/ExtractField";
import { TaskName } from "../enum/taskName.enum";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType("DailyTaskDto")
export class DailyTaskDto {
	@ExtractField()
	@Expose()
	_id: string;

	@ExtractField()
	@Expose()
	clanId: string;

	@ExtractField()
	@Expose()
	playerId: string;

	@Expose()
	title: string;

	@Expose()
	type: TaskName;

	@Expose()
	points: number;

	@Expose()
	coins: number;

	@Expose()
	startedAt: Date;

	@Expose()
	amountLeft: number;
}
