import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {SessionStage} from "../enum/SessionStage.enum";
import {ObjectId} from "mongodb";
import {Tester} from "../schemas/tester.schema";
import {DailyTask} from "../../dailyTasks/dailyTasks.schema";

export class BoxDto {
    @ExtractField()
    @Expose()
    _id:string;

    @Expose()
    adminPassword: string;

    @Expose()
    sessionStage: SessionStage;

    @Expose()
    testersSharedPassword: string | null;

    @Expose()
    boxRemovalTime: number;

    @Expose()
    sessionResetTime: number;


    @Expose()
    adminProfile_id: ObjectId;

    @Expose()
    adminPlayer_id: ObjectId;

    @Expose()
    clan_ids: ObjectId[];

    @Expose()
    soulHome_ids: ObjectId[];

    @Expose()
    room_ids: ObjectId[];

    @Expose()
    stock_ids: ObjectId[];


    @Expose()
    chat_id: ObjectId;

    @Expose()
    @Type(() => Tester)
    testers: Tester[];

    @Expose()
    accountClaimersIds: string[];

    @Expose()
    @Type(() => DailyTask)
    dailyTasks: DailyTask[];
}