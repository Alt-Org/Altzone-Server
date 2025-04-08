import {Expose} from "class-transformer";
import {ServerTaskName} from "../../../dailyTasks/enum/serverTaskName.enum";
import {ExtractField} from "../../../common/decorator/response/ExtractField";

export class PredefinedDailyTaskDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    type: ServerTaskName;

    @Expose()
    title: string;

    @Expose()
    amount: number;

    @Expose()
    points: number;

    @Expose()
    coins: number;

    @Expose()
    timeLimitMinutes: number;
}
