import { IsEnum, IsInt, IsMongoId, IsOptional } from 'class-validator';
import { IsCustomCharacterExists } from '../decorator/validation/IsCustomCharacterExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { CharacterId } from '../enum/characterId.enum';

export const UpdateCustomCharacterType = 'UpdateCustomCharacterType';
@AddType('UpdateCustomCharacterDto')
export class UpdateCustomCharacterDto {
  /**
   * ID of the custom character to update
   *
   * @example "661b55c4d9d2b21f00a1a4b2"
   */
  @IsCustomCharacterExists()
  @IsMongoId()
  _id: string;

  /**
   * New base character ID
   *
   * @example "202"
   */
  @IsOptional()
  @IsEnum(CharacterId)
  characterId?: CharacterId;

  /**
   * Updated defense value
   *
   * @example 30
   */
  @IsOptional()
  @IsInt()
  defence?: number;

  /**
   * Updated HP value
   *
   * @example 120
   */
  @IsOptional()
  @IsInt()
  hp?: number;

  /**
   * Updated size value
   *
   * @example 3
   */
  @IsOptional()
  @IsInt()
  size?: number;

  /**
   * Updated attack power
   *
   * @example 50
   */
  @IsOptional()
  @IsInt()
  attack?: number;

  /**
   * Updated speed value
   *
   * @example 6
   */
  @IsOptional()
  @IsInt()
  speed?: number;

  /**
   * Updated character level
   *
   * @example 5
   */
  @IsOptional()
  @IsInt()
  level?: number;
}
