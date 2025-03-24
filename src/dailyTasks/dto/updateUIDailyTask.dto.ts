import {IsInt, IsOptional} from "class-validator";

export class UpdateUIDailyTaskDto {
    @IsOptional()
    @IsInt()
    amount: number;
}
