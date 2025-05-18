import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import IsRoleRights from '../decorator/validation/IsRoleRights.decorator';
import { CLAN_ROLE_MAX_LENGTH } from '../const/validation';

export class UpdateClanRoleDto {
  /**
   * ID of the role to update
   *
   * @example "6650debcaf12345678abcd90"
   */
  @IsMongoId()
  _id: string;

  /**
   * Updated name of the role (optional)
   *
   * @example "Strategist"
   */
  @IsOptional()
  @IsString()
  @MaxLength(CLAN_ROLE_MAX_LENGTH)
  name?: string;

  /**
   * Permissions associated with this role
   *
   * @example { "EDIT_SOULHOME": true, "EDIT_CLAN_DATA": true }
   */
  @IsOptional()
  @IsRoleRights()
  rights?: Partial<Record<ClanBasicRight, true>>;
}
