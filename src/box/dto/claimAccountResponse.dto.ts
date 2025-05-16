import { Expose, Type } from 'class-transformer';
import { CustomCharacterDto } from '../../player/customCharacter/dto/customCharacter.dto';
import { ClanDto } from '../../clan/dto/clan.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { GameStatisticsDto } from '../../player/dto/gameStatistics.dto';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('ClaimAccountResponseDto')
export class ClaimAccountResponseDto {
  /**
   * Unique ID of the claimed account
   *
   * @example "663a6e4fde9f1a0012f3d001"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Points accumulated by the player
   *
   * @example 1250
   */
  @Expose()
  points: number;

  /**
   * Maximum number of items the player's backpack can hold
   *
   * @example 50
   */
  @Expose()
  backpackCapacity: number;

  /**
   * Whether the player is above 13 years old
   *
   * @example true
   */
  @Expose()
  above13?: boolean | null;

  /**
   * Whether parental authorization has been granted
   *
   * @example false
   */
  @Expose()
  parentalAuth: boolean | null;

  /**
   * Game statistics related to this account
   */
  @Type(() => GameStatisticsDto)
  @Expose()
  gameStatistics: GameStatisticsDto;

  /**
   * List of character IDs available to the player
   *
   * @example ["663a6f1cde9f1a0012f3d100", "663a6f9bde9f1a0012f3d200"]
   */
  @Expose()
  battleCharacter_ids?: string[];

  /**
   * ID of the currently selected avatar
   *
   * @example 3
   */
  @Expose()
  currentAvatarId?: number;

  /**
   * ID of the player's profile
   *
   * @example "663a6f1cde9f1a0012f3d100"
   */
  @ExtractField()
  @Expose()
  profile_id: string;

  /**
   * ID of the clan the player belongs to
   *
   * @example "663a6f9bde9f1a0012f3d200"
   */
  @ExtractField()
  @Expose()
  clan_id: string;

  /**
   * Information about the player's clan
   */
  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  /**
   * Custom characters created by the player
   */
  @Type(() => CustomCharacterDto)
  @Expose()
  CustomCharacter: CustomCharacterDto[];

  /**
   * Access token to authenticate future API requests
   *
   * @example "eyJhbGciOiJIUzI1NiIsInR..."
   */
  @Expose()
  accessToken: string;

  /**
   * Player's account password
   *
   * @example "securePass456"
   */
  @Expose()
  password: string;
}
