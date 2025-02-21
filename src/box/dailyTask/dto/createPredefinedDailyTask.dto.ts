import {IsEnum, IsNumber, IsString} from "class-validator";
import {TaskName} from "../../../dailyTasks/enum/taskName.enum";

export class CreatePredefinedDailyTaskDto {
    @IsEnum(TaskName)
    type: TaskName;

    @IsString()
    title: string;

    @IsNumber()
    amount: number;

    @IsNumber()
    points: number;

    @IsNumber()
    coins: number;

    @IsNumber()
    timeLimitMinutes: number;
}
