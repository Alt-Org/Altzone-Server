import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ClanToCreateDto } from './clanToCreate.dto';

export class ConfigureBoxDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ClanToCreateDto)
  @IsOptional()
  clansToCreate?: ClanToCreateDto[];

  @IsInt()
  @IsOptional()
  testersAmount?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  testersSharedPassword?: string;
}
