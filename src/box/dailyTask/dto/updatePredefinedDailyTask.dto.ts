import {IsEnum, IsMongoId, IsNumber, IsOptional, IsString} from "class-validator";
import {TaskName} from "../../../dailyTasks/enum/taskName.enum";

export class UpdatePredefinedDailyTaskDto {
    @IsMongoId()
    _id: string;

    @IsOptional()
    @IsEnum(TaskName)
    type?: TaskName;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsNumber()
    points?: number;

    @IsOptional()
    @IsNumber()
    coins?: number;

    @IsOptional()
    @IsNumber()
    timeLimitMinutes?: number;
}
