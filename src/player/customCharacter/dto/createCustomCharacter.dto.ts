import { IsEnum, IsInt } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { CharacterId } from '../enum/characterId.enum';

@AddType('CreateCustomCharacterDto')
export class CreateCustomCharacterDto {
  /**
   * Base character ID used as a template
   *
   * @example "201"
   */
  @IsEnum(CharacterId)
  characterId: CharacterId;

  /**
   * Starting level of the custom character
   *
   * @example 1
   */
  @IsInt()
  level: number;
}
