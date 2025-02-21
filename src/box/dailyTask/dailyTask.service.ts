import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import { Box, publicReferences } from "../schemas/box.schema";
import { BoxReference } from "../enum/BoxReference.enum";
import BasicService from "../../common/service/basicService/BasicService";
import {IServiceReturn} from "../../common/service/basicService/IService";
import {ObjectId} from "mongodb";
import { PredefinedDailyTask } from "./predefinedDailyTask.schema";
import {CreateDailyTask} from "./payloads/CreateDailyTask";

@Injectable()
export class DailyTaskService{
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
    async addDailyTask(box_id: string | ObjectId, task: CreateDailyTask): Promise<IServiceReturn<PredefinedDailyTask>> {
        return null;
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
    async addMultipleDailyTasks(box_id: string | ObjectId, tasks: CreateDailyTask[]): Promise<IServiceReturn<PredefinedDailyTask[]>> {
        return null;
    }

    /**
     * Updates a daily task in the box daily tasks array
     * @param box_id _id of the box
     * @param task task to update with _id field
     *
     * @returns true if the task was updated, or ServiceError:
     * - NOT_FOUND if the box was not found
     * - REQUIRED if box_id is null, undefined or empty string, or task is null, undefined or without _id
     */
    async updateDailyTask(box_id: string | ObjectId, task: Partial<PredefinedDailyTask>): Promise<IServiceReturn<true>> {
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
    async deleteDailyTask(box_id: string | ObjectId, task_id: string | ObjectId): Promise<IServiceReturn<true>> {
        return null;
    }
}
