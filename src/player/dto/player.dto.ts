import { Expose, Type } from 'class-transformer';
import { ClanDto } from '../../clan/dto/clan.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { CustomCharacterDto } from '../customCharacter/dto/customCharacter.dto';
import AddType from '../../common/base/decorator/AddType.decorator';
import { GameStatisticsDto } from './gameStatistics.dto';
import { TaskDto } from './task.dto';
import { AvatarDto } from './avatar.dto';
import { Min } from 'class-validator';

@AddType('PlayerDto')
export class PlayerDto {
  /**
   * Unique player ID
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Player display name
   *
   * @example "ShadowKnight"
   */
  @Expose()
  name: string;

  /**
   * Total points earned by player
   *
   * @example 1200
   */
  @Expose()
  points: number;

  /**
   * Total battle points earned by player
   *
   * @example 1200
   */
  @Min(0)
  @Expose()
  battlePoints: number;

  /**
   * Maximum capacity of player's backpack
   *
   * @example 30
   */
  @Expose()
  backpackCapacity: number;

  /**
   * Unique identifier (device/user)
   *
   * @example "device-uuid-12345"
   */
  @Expose()
  uniqueIdentifier: string;

  /**
   * Whether player is over 13
   *
   * @example true
   */
  @Expose()
  above13?: boolean | null;

  /**
   * Whether parental authorization was given
   *
   * @example false
   */
  @Expose()
  parentalAuth: boolean | null;

  /**
   * Game statistics
   */
  @Type(() => GameStatisticsDto)
  @Expose()
  gameStatistics: GameStatisticsDto;

  /**
   * List of battle character IDs
   */
  @ExtractField()
  @Expose()
  battleCharacter_ids?: string[];

  /**
   * ID of the current avatar
   */
  @Expose()
  currentAvatarId?: number;

  /**
   * Linked profile ID
   */
  @ExtractField()
  @Expose()
  profile_id: string;

  /**
   * Clan ID this player belongs to
   */
  @ExtractField()
  @Expose()
  clan_id: string;

  /**
   * Player's clan object
   */
  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  /**
   * Player's custom battle characters
   */
  @Type(() => CustomCharacterDto)
  @Expose()
  CustomCharacter: CustomCharacterDto[];

  /**
   * Player's currently active daily task
   */
  @Type(() => TaskDto)
  @Expose()
  DailyTask?: TaskDto;

  /**
   * Player's avatar
   */
  @Type(() => AvatarDto)
  @Expose()
  avatar?: AvatarDto;

  /**
   * ID of the role the player holds in the clan
   */
  @ExtractField()
  @Expose()
  clanRole_id?: string;
}
