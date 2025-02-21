import {Expose} from "class-transformer";
import {TaskName} from "../../../dailyTasks/enum/taskName.enum";
import {ExtractField} from "../../../common/decorator/response/ExtractField";

export class PredefinedDailyTaskDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    type: TaskName;

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
