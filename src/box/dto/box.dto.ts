import { Expose, Type } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { SessionStage } from '../enum/SessionStage.enum';
import { DailyTask } from '../../dailyTasks/dailyTasks.schema';
import { TesterDto } from './tester.dto';

export class BoxDto {
  /**
   * Unique identifier of the game box session
   *
   * @example "663a5d9cde9f1a0012f3b456"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Admin password used to manage the box session
   *
   * @example "adminSecret123"
   */
  @Expose()
  adminPassword: string;

  /**
   * Current stage of the session
   *
   * @example "Preparing"
   */
  @Expose()
  sessionStage: SessionStage;

  /**
   * Shared password for testers to access the session
   *
   * @example "testerPass456"
   */
  @Expose()
  testersSharedPassword: string | null;

  /**
   * Timestamp (in ms) when the box will be removed
   *
   * @example 1716553200000
   */
  @Expose()
  boxRemovalTime: number;

  /**
   * Timestamp (in ms) when the session will reset
   *
   * @example 1716639600000
   */
  @Expose()
  sessionResetTime: number;

  /**
   * ID of the admin's profile
   *
   * @example "663a5a9fde9f1a0012f3a111"
   */
  @Expose()
  adminProfile_id: string;

  /**
   * ID of the admin's in-game player
   *
   * @example "663a5a9fde9f1a0012f3a112"
   */
  @Expose()
  adminPlayer_id: string;

  /**
   * List of clan IDs associated with the box
   *
   * @example ["663a5b2cde9f1a0012f3a220"]
   */
  @Expose()
  clan_ids: string[];

  /**
   * IDs of SoulHomes linked to the box
   *
   * @example ["663a5c1ade9f1a0012f3a330"]
   */
  @Expose()
  soulHome_ids: string[];

  /**
   * IDs of rooms available in this box session
   *
   * @example ["663a5c8bde9f1a0012f3a440"]
   */
  @Expose()
  room_ids: string[];

  /**
   * IDs of inventory stocks in this session
   *
   * @example ["663a5d0ade9f1a0012f3a550"]
   */
  @Expose()
  stock_ids: string[];

  /**
   * List of testers currently connected to this session
   */
  @Expose()
  @Type(() => TesterDto)
  testers: TesterDto[];

  /**
   * List of IDs of users who claimed accounts during this session
   *
   * @example ["user123", "guest789"]
   */
  @Expose()
  accountClaimersIds: string[];

  /**
   * Daily tasks generated for this box session
   */
  @Expose()
  @Type(() => DailyTask)
  dailyTasks: DailyTask[];
}
