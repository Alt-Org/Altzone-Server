import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { TaskName } from "../enum/taskName.enum";
import { TaskFrequency } from "../enum/taskFrequency.enum";

export class CreateTaskDto {
	@IsNotEmpty()
	@IsMongoId()
	playerId: string;

	@IsNotEmpty()
	@IsEnum(TaskName)
	type: TaskName;

	@IsNotEmpty()
	@IsDate()
	startedAt: Date;

	@IsNotEmpty()
	@IsEnum(TaskFrequency)
	frequency: TaskFrequency;

	@IsNotEmpty()
	@IsNumber()
	amountLeft: number;

	@IsNotEmpty()
	@IsNumber()
	coins: number;

	@IsNotEmpty()
	@IsNumber()
	points: number;
}
