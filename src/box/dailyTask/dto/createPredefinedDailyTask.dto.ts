import {IsEnum, IsNumber, IsString} from "class-validator";
import {ServerTaskName} from "../../../dailyTasks/enum/serverTaskName.enum";

export class CreatePredefinedDailyTaskDto {
    @IsEnum(ServerTaskName)
    type: ServerTaskName;

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
