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
import {UITaskName} from "../enum/uiTaskName.enum";
import {cancelTransaction} from "../../common/function/cancelTransaction";

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
    public getUITasksForClan(clan_id: string): IServiceReturn<Omit<DailyTask, "_id">[]> {
        if (!clan_id)
            return [
                null,
                [
                    new ServiceError({
                        reason: SEReason.REQUIRED, field: "clan_id", value: clan_id,
                        message: "clan_id is required",
                    }),
                ],
            ];

        const tasks: Omit<DailyTask, "_id">[] = [];
        for (const taskName in uiDailyTasks) {
            const base: UIDailyTaskData = uiDailyTasks[taskName];
            const task: Omit<DailyTask, "_id"> = {
                ...base,
                clan_id,
                player_id: null,
                startedAt: null,
                amountLeft: base.amount,
            };
            tasks.push(task);
        }
        return [tasks, null];
    }

    /**
     * Updates the daily task for a given player. Decrements the amount left for the task.
     *
     * @param player_id - The ID of the player whose task is being updated.
     * @param amount - Amount of completed atomic tasks, default is 1
     * @returns The updated task and status or ServiceErrors if any occurred.
     */
    async updateTask(player_id: string, amount = 1): Promise<IServiceReturn<["updated" | "completed", DailyTask]>> {
        const [task, errors] = await this.findUIDailyTask(player_id);
        if (errors)
            return [null, errors];

        const isTaskCompleted = task.amountLeft - amount <= 0;

        if (isTaskCompleted) {
            const [isSuccess, errors] = await this.handleTaskCompletion(task);
            if (errors)
                return [null, errors];

            return [["completed", task], null];
        }

        const [isSuccess, updateErrors] = await this.handleTaskAmountUpdate(task, amount);
        if (updateErrors)
            return [null, updateErrors];

        return [["updated", task], null];
    }

    /**
     * Finds UI daily task from DB by its player_id field
     *
     * @param player_id _id of the player
     * @private
     *
     * @returns Found daily task or ServiceErrors:
     * - NOT_FOUND if the daily task can not be found
     * - WRONG_ENUM if the type of the daily task is not one of the UI daily tasks
     */
    private async findUIDailyTask(player_id: string): Promise<IServiceReturn<DailyTask>> {
        const [task, errors] = await this.basicService.readOne<DailyTaskDto>({
            filter: {player_id},
        });
        if (errors)
            return [null, errors];

        if (!Object.values(UITaskName).includes(task.type as UITaskName)) {
            return [null, [
                new ServiceError({
                    reason: SEReason.WRONG_ENUM, field: "task.type", value: task.type,
                    message: `The daily task type is not one of the UI daily tasks`,
                })
            ]];
        }

        return [task, null];
    }

    /**
     * Handles daily task update by decreasing amountLeft field of the task.
     *
     * @param task task data to update
     * @param decreaseAmount amount to decrease
     * @private
     *
     * @returns true if task was updated successfully or ServiceErrors if any occurred
     */
    private async handleTaskAmountUpdate(task: DailyTask, decreaseAmount: number): Promise<IServiceReturn<true>> {
        const updatingSession = await this.model.db.startSession();
        updatingSession.startTransaction();

        const updatedAmount = task.amountLeft - decreaseAmount;

        const [_, updateErrors] = await this.basicService.updateOneById(task._id.toString(), {amountLeft: updatedAmount});

        if (updateErrors) {
            await cancelTransaction(updatingSession, updateErrors);
            return [null, updateErrors];
        }

        await updatingSession.commitTransaction();
        await updatingSession.endSession();

        return [true, null];
    }

    /**
     * Handles daily task completion logic, which is removing the task from DB.
     *
     * @param task completed task data
     * @private
     *
     * @returns true if task completion was handled successfully or ServiceErrors if any occurred
     */
    private async handleTaskCompletion(task: DailyTask): Promise<IServiceReturn<true>> {
        const deletionSession = await this.model.db.startSession();
        deletionSession.startTransaction();

        const [, deletionErrors] = await this.basicService.deleteOneById(task._id.toString());

        if (deletionErrors) {
            await cancelTransaction(deletionSession, deletionErrors);
            return [null, deletionErrors];
        }

        await deletionSession.commitTransaction();
        await deletionSession.endSession();

        return [true, null];
    }
}
