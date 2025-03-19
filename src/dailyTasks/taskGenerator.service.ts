import {Injectable} from "@nestjs/common";
import {ServerTaskName} from "./enum/serverTaskName.enum";
import {TASK_CONSTS} from "./consts/taskConstants";
import {TaskTitle} from "./type/taskTitle.type";

type TaskInfo = {
    title: TaskTitle;
    type: ServerTaskName;
    points: number;
    coins: number;
    amount: number;
}

@Injectable()
export class TaskGeneratorService {
    constructor() {
    }

    /**
     * Retrieves a random task type from the available task names enum.
     *
     * @returns A randomly selected task name.
     */
    getRandomTaskType(): ServerTaskName {
        //TODO: Differentiate the task, that can be auto generated and the tasks that need to be predefined, when the daily tasks logic will be defined properly
        // const taskTypes = Object.values(ServerTaskName);
        const taskTypes = [ServerTaskName.PLAY_BATTLE, ServerTaskName.WIN_BATTLE, ServerTaskName.WRITE_CHAT_MESSAGE];
        const randomIndex = Math.floor(Math.random() * taskTypes.length);
        return taskTypes[randomIndex];
    }

    /**
     * Generates a task title based on the task type and amount.
     *
     * @param type - The type of the task.
     * @param amount - The number associated with the task.
     * @returns The generated task title as a string.
     * @throws Will throw an error if the task type is unknown.
     */
    getTaskTitle(type: ServerTaskName, amount: number): TaskTitle {
        switch (type) {
            case ServerTaskName.PLAY_BATTLE:
                return {fi: `Pelaa ${amount} taistelua`};
            case ServerTaskName.WIN_BATTLE:
                return {fi: `Voita ${amount} taistelua`};
            case ServerTaskName.WRITE_CHAT_MESSAGE:
                return {fi: `Lähetä ${amount} viestiä chattiin`};
            default:
                throw new Error("Unknown task type");
        }
    }

    /**
     * Generates a random task with random values for amount, points, coins, type, and title.
     *
     * @returns A partial Task missing the ids and startedAt fields and object containing randomly generated values.
     */
    createTaskRandomValues(): TaskInfo {
        const amount =
            Math.floor(
                Math.random() * (TASK_CONSTS.AMOUNT.MAX - TASK_CONSTS.AMOUNT.MIN + 1)
            ) + TASK_CONSTS.AMOUNT.MIN;
        const points =
            Math.floor(
                Math.random() * (TASK_CONSTS.POINTS.MAX - TASK_CONSTS.POINTS.MIN + 1)
            ) + TASK_CONSTS.POINTS.MIN;
        const coins = Math.floor(points * TASK_CONSTS.COINS.FACTOR);
        const taskType = this.getRandomTaskType();
        const titleString = this.getTaskTitle(taskType, amount);

        return {
            amount,
            points,
            coins,
            type: taskType,
            title: titleString
        };
    }
}
