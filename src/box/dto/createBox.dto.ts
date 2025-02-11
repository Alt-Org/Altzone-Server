import {
    IsArray,
    IsEnum,
    IsMongoId,
    IsNumber, IsOptional,
    IsString,
    ValidateNested
} from "class-validator";
import {SessionStage} from "../enum/SessionStage.enum";
import { ObjectId } from "mongoose";
import { Tester } from "../schemas/tester.schema";
import {Type} from "class-transformer";
import {DailyTask} from "../../dailyTasks/dailyTasks.schema";


export class CreateBoxDto {
    @IsString()
    adminPassword: string;

    @IsOptional()
    @IsEnum(SessionStage)
    sessionStage?: SessionStage;

    @IsOptional()
    @IsString()
    testersSharedPassword?: string | null;

    @IsNumber()
    boxRemovalTime: number;

    @IsNumber()
    sessionResetTime: number;


    @IsMongoId()
    adminProfile_id: ObjectId;

    @IsMongoId()
    adminPlayer_id: ObjectId;

    @IsArray()
    @IsMongoId({ each: true })
    clan_ids: ObjectId[];

    @IsArray()
    @IsMongoId({ each: true })
    soulHome_ids: ObjectId[];

    @IsArray()
    @IsMongoId({ each: true })
    room_ids: ObjectId[];

    @IsArray()
    @IsMongoId({ each: true })
    stock_ids: ObjectId[];


    @IsMongoId()
    chat_id: ObjectId;

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => Tester)
    testers?: Tester[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    accountClaimersIds?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => DailyTask)
    dailyTasks?: DailyTask[];
}