import {
  ArrayNotEmpty,
  IsArray,
  ArrayMaxSize,
  IsEnum,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { IsClanExists } from '../decorator/validation/IsClanExists.decorator';
import { IsPlayerExists } from '../../player/decorator/validation/IsPlayerExists.decorator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ClanLabel } from '../enum/clanLabel.enum';
import { AgeRange } from '../enum/ageRange.enum';
import { Goal } from '../enum/goal.enum';
import { Language } from '../../common/enum/language.enum';
import { ClanLogoDto } from './clanLogo.dto';
import { Type } from 'class-transformer';

@AddType('UpdateClanDto')
export class UpdateClanDto {
  @IsClanExists()
  @IsMongoId()
  _id: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  name?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @ValidateNested()
  @Type(() => ClanLogoDto)
  @IsOptional()
  clanLogo?: ClanLogoDto;

  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(ClanLabel, { each: true })
  @IsOptional()
  labels?: ClanLabel[];

  //TODO: validate is player exists does not work
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsPlayerExists)
  @IsOptional()
  admin_idsToAdd?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  admin_idsToDelete?: string[];

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  @IsEnum(AgeRange)
  @IsOptional()
  ageRange?: AgeRange;

  @IsEnum(Goal)
  @IsOptional()
  goal?: Goal;

  @IsString()
  @IsOptional()
  phrase?: string;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
