import {IsEnum, IsMongoId, IsNumber, IsOptional, IsString} from "class-validator";
import {ServerTaskName} from "../../../dailyTasks/enum/serverTaskName.enum";

export class UpdatePredefinedDailyTaskDto {
    @IsMongoId()
    _id: string;

    @IsOptional()
    @IsEnum(ServerTaskName)
    type?: ServerTaskName;

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
