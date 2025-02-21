import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Box, BoxDocument, publicReferences } from "../schemas/box.schema";
import { BoxReference } from "../enum/BoxReference.enum";
import BasicService from "../../common/service/basicService/BasicService";
import { IServiceReturn } from "../../common/service/basicService/IService";
import { ObjectId } from "mongodb";
import { PredefinedDailyTask, PredefinedDailyTaskDoc } from "./predefinedDailyTask.schema";
import { CreateDailyTask } from "./payloads/CreateDailyTask";
import ServiceError from "../../common/service/basicService/ServiceError";
import { SEReason } from "../../common/service/basicService/SEReason";

@Injectable()
export class DailyTaskService {
    public constructor(
        @InjectModel(Box.name) public readonly model: Model<Box>,
    ) {
        this.refsInModel = publicReferences;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: BoxReference[];
    private readonly basicService: BasicService;

    /**
     * Adds a new daily task to box daily tasks array
     * @param box_id _id of the box
     * @param task task to add
     *
     * @returns created task, or ServiceError:
     * - NOT_FOUND if the box was not found
     * - REQUIRED if box_id is null, undefined or empty string, or task is null or undefined
     */
    async addOne(box_id: string | ObjectId, task: CreateDailyTask): Promise<IServiceReturn<PredefinedDailyTask>> {
        if (!box_id)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'box_id', value: box_id,
                message: 'box_id is required'
            })]];

        if (!task)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'task', value: task,
                message: 'task is required'
            })]];

        const convertedBox_id = typeof box_id === 'string' ? box_id : box_id.toString();

        const [isUpdated, updateErrors] = await this.basicService.updateOneById(convertedBox_id, { $push: { dailyTasks: task } });
        if (updateErrors && updateErrors[0].reason === SEReason.NOT_FOUND)
            return [null, [
                new ServiceError({
                    ...updateErrors[0], field: 'box_id',
                    message: 'Box with this _id not found'
                })
            ]];

        if (updateErrors)
            return [null, updateErrors];

        const [updatedBox, readErrors] = await this.basicService.readOneById<BoxDocument>(convertedBox_id);
        if (readErrors)
            return [null, readErrors];

        const createdTask = updatedBox.dailyTasks.find(dTask => this.areSameTasks(dTask, task));
        return [createdTask, null];
    }

    /**
     * Adds multiple daily tasks to box daily tasks
     * @param box_id _id of the box
     * @param tasks tasks to add
     *
     * @returns created tasks, or ServiceError:
     * - NOT_FOUND if the box was not found
     * - REQUIRED if box_id is null, undefined or empty string, or tasks is null, undefined or empty array
     */
    async addMultiple(box_id: string | ObjectId, tasks: CreateDailyTask[]): Promise<IServiceReturn<PredefinedDailyTask[]>> {
        if (!box_id)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'box_id', value: box_id,
                message: 'box_id is required'
            })]];

        if (!tasks || tasks.length === 0)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'tasks', value: tasks,
                message: 'task is required'
            })]];

        const convertedBox_id = typeof box_id === 'string' ? box_id : box_id.toString();

        const [isUpdated, updateErrors] = await this.basicService.updateOneById(convertedBox_id, { $push: { dailyTasks: tasks } });
        if (updateErrors && updateErrors[0].reason === SEReason.NOT_FOUND)
            return [null, [
                new ServiceError({
                    ...updateErrors[0], field: 'box_id',
                    message: 'Box with this _id not found'
                })
            ]];

        if (updateErrors)
            return [null, updateErrors];

        const [updatedBox, readErrors] = await this.basicService.readOneById<BoxDocument>(convertedBox_id);
        if (readErrors)
            return [null, readErrors];

        const createdTasks: PredefinedDailyTask[] = [];
        for(let i=0; i<tasks.length; i++){
            const currTask = tasks[i];
            const createdTask = updatedBox.dailyTasks.find(dTask => this.areSameTasks(dTask, currTask));
            if(createdTask)
                createdTasks.push(createdTask);
        }

        return [createdTasks, null];
    }

    /**
     * Updates a daily task in the box daily tasks array
     * @param box_id _id of the box
     * @param task task to update with _id field
     *
     * @returns true if the task was updated, or ServiceError:
     * - NOT_FOUND if the box or task was not found
     * - REQUIRED if box_id is null, undefined or empty string, or task is null, undefined or without _id
     */
    async updateOneById(box_id: string | ObjectId, task: Partial<PredefinedDailyTask>): Promise<IServiceReturn<true>> {
        return null;
    }

    /**
     * Deletes a daily task from box by _id
     * @param box_id _id of the box
     * @param task_id task _id to delete
     *
     * @returns true if the task was deleted, or ServiceError:
     * - NOT_FOUND if the box or task was not found
     * - REQUIRED if box_id is null, undefined or empty string, or task is null or undefined
     */
    async deleteOneById(box_id: string | ObjectId, task_id: string | ObjectId): Promise<IServiceReturn<true>> {
        return null;
    }

    private areSameTasks(task1: Partial<PredefinedDailyTask>, task2: Partial<PredefinedDailyTask>) {
        return task1.amount === task2.amount &&
            task1.coins === task2.coins &&
            task1.points === task2.points &&
            task1.timeLimitMinutes === task2.timeLimitMinutes &&
            task1.title === task2.title &&
            task1.type === task2.type;
    }
}
