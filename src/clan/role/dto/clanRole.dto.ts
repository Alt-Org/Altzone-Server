import { ClanRoleType } from '../enum/clanRoleType.enum';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import { Expose } from 'class-transformer';
import { ExtractField } from '../../../common/decorator/response/ExtractField';

export default class ClanRoleDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  claRoleType: ClanRoleType;

  @Expose()
  rights: Partial<Record<ClanBasicRight, true>>;
}
