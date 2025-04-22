import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import IsRoleRights from '../decorator/validation/IsRoleRights.decorator';
import { CLAN_ROLE_MAX_LENGTH } from '../const/validation';

export class UpdateClanRoleDto {
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsString()
  @MaxLength(CLAN_ROLE_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsRoleRights()
  rights?: Partial<Record<ClanBasicRight, true>>;
}
