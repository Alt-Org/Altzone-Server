import {
  IsArray,
  ArrayMaxSize,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { ClanLabel } from '../enum/clanLabel.enum';
import { AgeRange } from '../enum/ageRange.enum';
import { Language } from '../../common/enum/language.enum';
import { Goal } from '../enum/goal.enum';
import { Type } from 'class-transformer';
import { ClanLogoDto } from './clanLogo.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a clan.
 */
export class CreateClanDto {
  /**
   * Unique name of the clan (max 20 characters).
   * @example "my_clan"
   */
  @ApiProperty({
    uniqueItems: true,
  })
  @IsString()
  @MaxLength(20)
  name: string;

  /**
   * Short tag used to identify the clan.
   * @example "CLN123"
   */
  @IsString()
  tag: string;

  /**
   * Optional logo of the clan.
   * @example { logoType: "Heart", pieceColors: [#FFFFFF] }
   */
  @Type(() => ClanLogoDto)
  @IsOptional()
  @ValidateNested()
  clanLogo?: ClanLogoDto;

  /**
   * List of labels describing the clan (max 5).
   * @example ["ELÄINRAKKAAT", "SYVÄLLISET"]
   */
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(ClanLabel, { each: true })
  labels: ClanLabel[];

  /**
   * Whether the clan is open to new members.
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  /**
   * Password used for joining a closed clan.
   * @example "p4sswrd!"
   */
  @IsString()
  @IsOptional()
  password?: string;

  /**
   * Optional age range preference for clan members.
   * @example "ALL"
   */
  @IsEnum(AgeRange)
  @IsOptional()
  ageRange?: AgeRange;

  /**
   * Optional goal or focus of the clan.
   * @example "Fiilistely"
   */
  @IsEnum(Goal)
  @IsOptional()
  goal?: Goal;

  /**
   * Clan motto or phrase.
   * @example "Victory or nothing!"
   */
  @IsString()
  phrase: string;

  /**
   * Preferred language used in the clan.
   * @example "English"
   */
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
