import { IsString, MaxLength } from 'class-validator';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import IsRoleRights from '../decorator/validation/IsRoleRights.decorator';
import { CLAN_ROLE_MAX_LENGTH } from '../const/validation';

export class CreateClanRoleDto {
  /**
   * Human-readable name of the role, must be unique for a clan
   *
   * @example "My role"
   */
  @IsString()
  @MaxLength(CLAN_ROLE_MAX_LENGTH)
  name: string;

  /**
   * Permissions associated with this role
   *
   * @example { "EDIT_SOULHOME": true, "EDIT_CLAN_DATA": true }
   */
  @IsRoleRights()
  rights: Partial<Record<ClanBasicRight, true>>;
}
