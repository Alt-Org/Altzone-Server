import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { TaskName } from "../enum/taskName.enum";
import { TaskFrequency } from "../enum/taskFrequency.enum";

export class CreateTaskDto {
	@IsNotEmpty()
	@IsMongoId()
	playerId: string;

	@IsNotEmpty()
	@IsNumber()
	taskId: number;
	@IsNotEmpty()

	@IsNotEmpty()
	@IsDate()
	startedAt: Date;

	@IsNotEmpty()
	@IsNumber()
	amountLeft: number;
}
