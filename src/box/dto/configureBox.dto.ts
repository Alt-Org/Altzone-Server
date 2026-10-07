import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ClanToCreateDto } from './clanToCreate.dto';
import {
  BOX_SESSION_MAX_PARTICIPANTS,
  BOX_SESSION_MIN_PARTICIPANTS,
} from '../consts/boxSessionConstants';

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
  @Min(BOX_SESSION_MIN_PARTICIPANTS)
  @Max(BOX_SESSION_MAX_PARTICIPANTS)
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
}
