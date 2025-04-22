import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SessionStage } from '../enum/SessionStage.enum';
import { ObjectId } from 'mongodb';
import { Type } from 'class-transformer';
import { Tester } from '../schemas/tester.schema';
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';

export class UpdateBoxDto {
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsString()
  adminPassword?: string;

  @IsOptional()
  @IsEnum(SessionStage)
  sessionStage?: SessionStage;

  @IsOptional()
  @IsString()
  testersSharedPassword?: string | null;

  @IsOptional()
  @IsNumber()
  boxRemovalTime?: number;

  @IsOptional()
  @IsNumber()
  sessionResetTime?: number;

  @IsOptional()
  @IsMongoId()
  adminProfile_id?: ObjectId;

  @IsOptional()
  @IsMongoId()
  adminPlayer_id?: ObjectId;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  clan_ids?: ObjectId[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  soulHome_ids?: ObjectId[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  room_ids?: ObjectId[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  stock_ids?: ObjectId[];

  @IsOptional()
  @IsMongoId()
  chat_id?: ObjectId;

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
