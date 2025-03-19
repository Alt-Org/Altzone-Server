import {Injectable} from "@nestjs/common";
import {DailyTasksService} from "../dailyTasks.service";
import {InjectModel} from "@nestjs/mongoose";
import {DailyTask} from "../dailyTasks.schema";
import {Model} from "mongoose";
import BasicService from "../../common/service/basicService/BasicService";
import {UIDailyTaskData, uiDailyTasks} from "./uiDailyTasks";
import {IServiceReturn} from "../../common/service/basicService/IService";
import ServiceError from "../../common/service/basicService/ServiceError";
import {SEReason} from "../../common/service/basicService/SEReason";

@Injectable()
export default class UIDailyTasksService {
    constructor(
        private readonly dailyTasksService: DailyTasksService,
        @InjectModel(DailyTask.name) public readonly model: Model<DailyTask>,
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
        if(!clan_id)
            return [null, [new ServiceError({
                reason: SEReason.REQUIRED, field: 'clan_id', value: clan_id,
                message: 'clan_id is required'
            })]];

        const tasks: Omit<DailyTask, '_id'>[] = [];
        for(const taskName in uiDailyTasks){
            const base: UIDailyTaskData = uiDailyTasks[taskName];
            const task: Omit<DailyTask, '_id'> = {...base, clan_id, player_id: null, startedAt: null, amountLeft: base.amount};
            tasks.push(task);
        }
        return [tasks, null];
    }
}
