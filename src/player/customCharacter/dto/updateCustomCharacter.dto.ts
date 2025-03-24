import { IsEnum, IsInt, IsMongoId, IsOptional } from 'class-validator';
import { IsCustomCharacterExists } from '../decorator/validation/IsCustomCharacterExists.decorator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { CharacterId } from '../enum/characterId.enum';

export const UpdateCustomCharacterType = 'UpdateCustomCharacterType';
@AddType('UpdateCustomCharacterDto')
export class UpdateCustomCharacterDto {
  @IsCustomCharacterExists()
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsEnum(CharacterId)
  characterId?: CharacterId;

  @IsOptional()
  @IsInt()
  defence?: number;

  @IsOptional()
  @IsInt()
  hp?: number;

  @IsOptional()
  @IsInt()
  size?: number;

  @IsOptional()
  @IsInt()
  attack?: number;

  @IsOptional()
  @IsInt()
  speed?: number;

  @IsOptional()
  @IsInt()
  level?: number;
}
