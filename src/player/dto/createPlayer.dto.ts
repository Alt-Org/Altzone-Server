import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsProfileExists } from '../../profile/decorator/validation/IsProfileExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Type } from 'class-transformer';
import { ModifyAvatarDto } from './modifyAvatar.dto';
import { IsMongoIdOrNull } from '../../common/decorator/validation/IsMongoIdOrNull.decorator';

@AddType('CreatePlayerDto')
export class CreatePlayerDto {
  @IsString()
  name: string;

  @IsInt()
  backpackCapacity: number;

  @IsString()
  uniqueIdentifier: string;

  @IsOptional()
  @IsBoolean()
  above13?: boolean;

  @IsOptional()
  @IsBoolean()
  parentalAuth?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsMongoIdOrNull({ each: true })
  battleCharacter_ids?: string[];

  @IsOptional()
  @IsInt()
  currentAvatarId?: number;

  @IsOptional()
  @IsProfileExists()
  @IsMongoId()
  profile_id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModifyAvatarDto)
  avatar?: ModifyAvatarDto;
}
