import { ClanRoleType } from '../enum/clanRoleType.enum';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import { Expose } from 'class-transformer';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

export default class ClanRoleDto {
  /**
   * Unique identifier of the clan role
   *
   * @example "6650debcaf12345678abcd90"
   */
  @ExtractField()
  @Expose()
  _id: string;

  /**
   * Human-readable name of the role, must be unique for a clan
   *
   * @example "My role"
   */
  @Expose()
  name: string;

  /**
   * Type of the role
   *
   * @example "named"
   */
  @Expose()
  clanRoleType: ClanRoleType;

  /**
   * Permissions associated with this role
   *
   * @example { "EDIT_SOULHOME": true, "EDIT_CLAN_DATA": true }
   */
  @Expose()
  rights: Partial<Record<ClanBasicRight, true>>;
}
