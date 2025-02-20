import {TaskName} from "../../dailyTasks/enum/taskName.enum";

export class PredefinedDailyTask {
    type: TaskName;
    title: string;
    amount: number;
    points: number;
    coins: number;
    timeLimitMinutes: number;
}
