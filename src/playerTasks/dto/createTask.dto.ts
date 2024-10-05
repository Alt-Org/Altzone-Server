import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { TaskName } from "../enum/taskName.enum";

export class CreateTaskDto {
	@IsNotEmpty()
	@IsMongoId()
	playerId: string;

	@IsNotEmpty()
	@IsNumber()
	taskId: number;

	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => value ?? 0) // Default value 0
	progressAmount: number;

	@IsNotEmpty()
	@IsNumber()
	targetAmount: number;

	@IsNotEmpty()
	@IsEnum(TaskName)
	type: TaskName;

	@IsNotEmpty()
	@IsDate()
	expiryDate: Date;
}