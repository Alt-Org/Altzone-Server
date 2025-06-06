import { Expose, Type } from 'class-transformer';
import { ExtractField } from '../../../common/decorator/response/ExtractField';
import { PlayerDto } from '../../dto/player.dto';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { CharacterId } from '../enum/characterId.enum';

@AddType('CustomCharacterDto')
export class CustomCharacterDto {
  /**
   * Unique ID of the custom character
   *
   * @example "661b55c4d9d2b21f00a1a4b2"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Base character ID
   *
   * @example "201"
   */
  @Expose()
  characterId: CharacterId;

  /**
   * Character's defense value
   *
   * @example 25
   */
  @Expose()
  defence: number;

  /**
   * Character's total health points
   *
   * @example 100
   */
  @Expose()
  hp: number;

  /**
   * Character size value (affects hitbox or visuals)
   *
   * @example 2
   */
  @Expose()
  size: number;

  /**
   * Movement speed of the character
   *
   * @example 5
   */
  @Expose()
  speed: number;

  /**
   * Attack power of the character
   *
   * @example 40
   */
  @Expose()
  attack: number;

  /**
   * Level of the character
   *
   * @example 3
   */
  @Expose()
  level: number;

  /**
   * Player ID who owns this custom character
   *
   * @example "661b55c4d9d2b21f00a1a4a1"
   */
  @ExtractField()
  @Expose()
  player_id: string;

  /**
   * Player object who owns this custom character
   */
  @Type(() => PlayerDto)
  @Expose()
  Player: PlayerDto;
}
