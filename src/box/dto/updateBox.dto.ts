import {
  ArrayMaxSize,
  ArrayMinSize,
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
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import { ClanToCreateDto } from './clanToCreate.dto';

export class UpdateBoxDto {
  /**
   * Unique ID of the box to update
   *
   * @example "663a7352de9f1a0012f3da10"
   */
  @IsMongoId()
  _id: string;

  /**
   * New admin password, if updating
   *
   * @example "newAdminPass123"
   */
  @IsOptional()
  @IsString()
  adminPassword?: string;

  /**
   * New session stage, if updating
   *
   * @example "Testing"
   */
  @IsOptional()
  @IsEnum(SessionStage)
  sessionStage?: SessionStage;

  /**
   * New shared password for testers
   *
   * @example "newTesterPass"
   */
  @IsOptional()
  @IsString()
  testersSharedPassword?: string | null;

  /**
   * Updated timestamp (in ms) for when the box will be removed
   *
   * @example 1717500000000
   */
  @IsOptional()
  @IsNumber()
  boxRemovalTime?: number;

  /**
   * Updated timestamp (in ms) for when the session will reset
   *
   * @example 1717586400000
   */
  @IsOptional()
  @IsNumber()
  sessionResetTime?: number;

  /**
   * Updated admin profile ID
   *
   * @example "663a739ade9f1a0012f3db00"
   */
  @IsOptional()
  @IsMongoId()
  adminProfile_id?: ObjectId;

  /**
   * Updated admin player ID
   *
   * @example "663a739ade9f1a0012f3db01"
   */
  @IsOptional()
  @IsMongoId()
  adminPlayer_id?: ObjectId;

  /**
   * Updated list of clan IDs
   *
   * @example ["663a73c6de9f1a0012f3db10"]
   */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  createdClan_ids?: ObjectId[];

  /**
   * Updated list of clans to create.
   */
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ClanToCreateDto)
  @IsOptional()
  clansToCreate?: ClanToCreateDto[];

  /**
   * Updated chat ID
   *
   * @example "663a74b6de9f1a0012f3db50"
   */
  @IsOptional()
  @IsMongoId()
  chat_id?: ObjectId;

  /**
   * Updated list of account claimers' IDs
   *
   * @example ["663a74b6de9f1a0012f3db50", "663a743bde9f1a0012f3db30"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accountClaimersIds?: string[];

  /**
   * Updated daily tasks
   */
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => DailyTask)
  dailyTasks?: DailyTask[];
}
