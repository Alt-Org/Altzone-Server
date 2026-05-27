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
  IsNotEmpty,
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
import { StallDto } from './stall.dto';
import { CreateClanRoleDto } from '../role/dto/createClanRole.dto';
import { ClanGovernanceUpdateDto } from './clanGovernanceUpdate.dto';
import { ApiProperty } from '@nestjs/swagger';

@AddType('UpdateClanDto')
export class UpdateClanDto {
  /**
   * ID of the clan to update
   *
   * @example "67fe4e2d8a54d4cc39266a43"
   */
  @IsClanExists()
  @IsMongoId()
  _id: string;

  /**
   * New name of the clan (optional)
   *
   * @example "Warriors Of Light"
   */
  @IsString()
  @IsOptional()
  @MaxLength(20)
  name?: string;

  /**
   * New tag for the clan (optional)
   *
   * @example "WOL"
   */
  @IsString()
  @IsOptional()
  tag?: string;

  /**
   * New logo configuration for the clan (optional)
   */
  @ApiProperty({
    type: () => ClanLogoDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => ClanLogoDto)
  @IsOptional()
  clanLogo?: ClanLogoDto;

  /**
   * Governance payload for role and admin updates (fully optional).
   * Used when an update is processed after a successful vote.
   */
  @ValidateNested()
  @Type(() => ClanGovernanceUpdateDto)
  @IsOptional()
  governancePayload?: ClanGovernanceUpdateDto;

  /**
   * Updated labels for the clan (max 5, optional)
   *
   * @example ["eläinrakkaat", "syvälliset"]
   */
  @IsArray()
  @ArrayMaxSize(5)
  @IsEnum(ClanLabel, { each: true })
  @IsOptional()
  labels?: ClanLabel[];

  /**
   * Player IDs to be added as clan administrators (optional)
   *
   * @example ["67fe4e2d8a54d4cc39266a42", "67fe4e2d8a54d4cc39266a41"]
   */
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsPlayerExists)
  @IsOptional()
  admin_idsToAdd?: string[];

  /**
   * Player IDs to be removed from clan administrators (optional)
   *
   * @example ["67fe4e2d8a54d4cc39266a43"]
   */
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  admin_idsToDelete?: string[];

  /**
   * Whether the clan is open to join without admin approval (optional)
   *
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  /**
   * Password used for joining a closed clan.
   *
   * @example "p4sswrd!"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  /**
   * Age range restriction for clan members (optional)
   *
   * @example "All"
   */
  @IsEnum(AgeRange)
  @IsOptional()
  ageRange?: AgeRange;

  /**
   * Goal or focus of the clan (optional)
   *
   * @example "Competitive"
   */
  @IsEnum(Goal)
  @IsOptional()
  goal?: Goal;

  /**
   * Clan's motto or slogan (optional)
   *
   * @example "Together we rise"
   */
  @IsString()
  @IsOptional()
  phrase?: string;

  /**
   * Preferred language of the clan (optional)
   *
   * @example "English"
   */
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  /**
   * Proposed roles for the clan (optional)
   * * @example
   * [
   * {
   * "name": "Veteran",
   * "rights": { "shop": true, "edit_soulhome": true }
   * }
   * ]
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateClanRoleDto)
  roles?: CreateClanRoleDto[];

  /**
   * Clan stall
   * @example { adPoster: { border: "border1", colour: "red", mainFurniture: "table" }, maxSlots: 10 }
   */
  @Type(() => StallDto)
  @IsOptional()
  stall?: StallDto;
}
