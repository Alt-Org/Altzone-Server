import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {DailyTask} from "../dailyTasks.schema";
import {Model} from "mongoose";
import BasicService from "../../common/service/basicService/BasicService";
import {UIDailyTaskData, uiDailyTasks} from "./uiDailyTasks";
import {IServiceReturn} from "../../common/service/basicService/IService";
import ServiceError from "../../common/service/basicService/ServiceError";
import {SEReason} from "../../common/service/basicService/SEReason";
import {DailyTaskDto} from "../dto/dailyTask.dto";
import {ObjectId} from "mongodb";

@Injectable()
export default class UIDailyTasksService {
    constructor(
        @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>
    ) {
        this.basicService = new BasicService(model);
    }

    private readonly basicService: BasicService;

    /**
     * Creates an array containing daily tasks for UI side managed tasks.
     *
     * Notice that player_id will be set to null
     *
     * @param clan_id _id of the clan
     * @returns an array containing daily tasks for UI side managed tasks or REQUIRED if clan_id is not provided
     */
    public getUITasksForClan(clan_id: string): IServiceReturn<Omit<DailyTask, '_id'>[]> {
        if (!clan_id)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'clan_id', value: clan_id,
                message: 'clan_id is required'
            })]];

        const tasks: Omit<DailyTask, '_id'>[] = [];
        for (const taskName in uiDailyTasks) {
            const base: UIDailyTaskData = uiDailyTasks[taskName];
            const task: Omit<DailyTask, '_id'> = {
                ...base,
                clan_id,
                player_id: null,
                startedAt: null,
                amountLeft: base.amount
            };
            tasks.push(task);
        }
        return [tasks, null];
    }

    /**
     * Updates the daily task for a given player. Decrements the amount left for the task.
     *
     * @param task_id - The ID of the task to update.
     * @param player_id - The ID of the player whose task is being updated.
     * @param amount - Amount of completed atomic tasks, default is 1
     * @returns The updated task and status or ServiceErrors if any occurred.
     */
    async updateTask(task_id: string | ObjectId, player_id: string | ObjectId, amount = 1): Promise<IServiceReturn<['updated' | 'completed', DailyTask]>> {
        const task_idStr = task_id.toString();

        const [task, error] = await this.basicService.readOneById<DailyTaskDto>(task_idStr);
        if (error)
            return [null, error];

        task.amountLeft -= amount;

        if (task.amountLeft <= 0)
            return [['completed', task], null];

        const [_, updateError] = await this.basicService.updateOneById(task_idStr, task);
        if (updateError)
            return [null, updateError];

        return [['updated', task], null];
    }
}
