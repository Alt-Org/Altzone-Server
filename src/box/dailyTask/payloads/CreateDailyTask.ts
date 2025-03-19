import {ServerTaskName} from "../../../dailyTasks/enum/serverTaskName.enum";

export class CreateDailyTask {
    type: ServerTaskName;
    title: string;
    amount: number;
    points: number;
    coins: number;
    timeLimitMinutes: number;
}
