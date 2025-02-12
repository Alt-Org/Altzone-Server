import {Injectable} from "@nestjs/common";
import {TaskName} from "./enum/taskName.enum";
import {Task} from "./type/task.type";
import {TASK_CONSTS} from "./consts/taskConstants";
import {TaskTitle} from "./type/taskTitle.type";

@Injectable()
export class TaskGeneratorService {
    constructor() {
    }

    /**
     * Retrieves a random task type from the available task names enum.
     *
     * @returns A randomly selected task name.
     */
    getRandomTaskType(): TaskName {
        const taskTypes = Object.values(TaskName);
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
    getTaskTitle(type: TaskName, amount: number): TaskTitle {
        switch (type) {
            case TaskName.PLAY_BATTLE:
                return {fi: `Pelaa ${amount} taistelua`};
            case TaskName.WIN_BATTLE:
                return {fi: `Voita ${amount} taistelua`};
            case TaskName.WRITE_CHAT_MESSAGE:
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
    createTaskRandomValues(): Partial<Task> {
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
            title: titleString,
        };
    }
}