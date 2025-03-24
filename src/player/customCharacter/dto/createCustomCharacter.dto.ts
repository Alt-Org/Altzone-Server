import { IsEnum, IsInt } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { CharacterId } from '../enum/characterId.enum';

@AddType('CreateCustomCharacterDto')
export class CreateCustomCharacterDto {
  @IsEnum(CharacterId)
  characterId: CharacterId;

  @IsInt()
  level: number;
}
