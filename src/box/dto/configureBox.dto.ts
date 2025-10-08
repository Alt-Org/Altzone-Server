import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ClanToCreateDto } from './clanToCreate.dto';

export class ConfigureBoxDto {
  /**
   * Array of clans to be created for the test session (must contain exactly 2 clans).
   *
   * @example [{ name: "Warriors", isOpen: true }, { name: "Knights", isOpen: false }]
   */
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ClanToCreateDto)
  @IsOptional()
  clansToCreate?: ClanToCreateDto[];

  /**
   * Number of testers for the session.
   *
   * @example 10
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  testersAmount?: number;

  /**
   * Shared password for testers.
   *
   * @example "test1234"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  testersSharedPassword?: string;

  // TODO: Add the name when taking v2 in use
}
