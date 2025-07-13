import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { Expose, Type } from 'class-transformer';
import { SessionStage } from '../enum/SessionStage.enum';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { PlayerDto } from '../../player/dto/player.dto';
import { ClanDto } from '../../clan/dto/clan.dto';

export class CreatedBoxDto {
  /**
   * Unique ID of the newly created box
   *
   * @example "663a709ade9f1a0012f3d310"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Token used by the admin to manage the box session
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @Expose()
  accessToken: string;

  /**
   * Current stage of the game session
   *
   * @example "Preparing"
   */
  @Expose()
  sessionStage: SessionStage;

  /**
   * Timestamp (in ms) when this session will expire
   *
   * @example 1717003200000
   */
  @Expose()
  boxRemovalTime: number;

  /**
   * Timestamp (in ms) when this session will reset
   *
   * @example 1717089600000
   */
  @Expose()
  sessionResetTime: number;

  /**
   * ID of the admin's profile
   *
   * @example "663a70ecde9f1a0012f3d420"
   */
  @Expose()
  adminProfile_id: string;

  /**
   * ID of the admin's in-game player
   *
   * @example "663a70ecde9f1a0012f3d421"
   */
  @Expose()
  adminPlayer_id: string;

  /**
   * IDs of clans in the created session
   *
   * @example ["663a711dde9f1a0012f3d500"]
   */
  @Expose()
  clan_ids: string[];

  /**
   * IDs of SoulHomes generated for the session
   *
   * @example ["663a717ade9f1a0012f3d600"]
   */
  @Expose()
  soulHome_ids: string[];

  /**
   * IDs of game rooms created in this session
   *
   * @example ["663a719fde9f1a0012f3d700"]
   */
  @Expose()
  room_ids: string[];

  /**
   * IDs of inventory stocks initialized
   *
   * @example ["663a71eade9f1a0012f3d800"]
   */
  @Expose()
  stock_ids: string[];

  /**
   * ID of the chat created for the session
   *
   * @example "663a7223de9f1a0012f3d900"
   */
  @Expose()
  chat_id: string;

  /**
   * Player object for the admin player
   */
  @Type(() => PlayerDto)
  @Expose()
  adminPlayer: Player;

  /**
   * Clans associated with this session
   */
  @Type(() => ClanDto)
  @Expose()
  clans: Clan[];
}
