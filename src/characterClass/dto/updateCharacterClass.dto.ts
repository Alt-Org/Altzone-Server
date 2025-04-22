import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { GestaltCycle } from '../../common/enum/gestaltCycle.enum';
import { IsCharacterClassExists } from '../decorator/validation/IsCharacterClassExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';

/**
 * This class is used for validation incoming requests while updating a CharacterClass.
 *
 * Notice that usually all fields except for the _id are optional, so that only specified fields will be updated.
 *
 * Notice that if the validation will be failed the controller method will not be called and Bad Request error will be returned to client.
 * You do not have to do a thing about the validation, only specify the decorators for checking and that's it
 */
@AddType('UpdateCharacterClassDto')
export class UpdateCharacterClassDto {
  @IsCharacterClassExists()
  @IsMongoId()
  _id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(GestaltCycle)
  @IsOptional()
  gestaltCycle: GestaltCycle;

  @IsInt()
  @IsOptional()
  speed: number;

  @IsInt()
  @IsOptional()
  resistance: number;

  @IsInt()
  @IsOptional()
  attack: number;

  @IsInt()
  @IsOptional()
  defence: number;
}
