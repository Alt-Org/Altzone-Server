import { IsString, MaxLength } from 'class-validator';
import { ClanBasicRight } from '../enum/clanBasicRight.enum';
import IsRoleRights from '../decorator/validation/IsRoleRights.decorator';

export class CreateClanRoleDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsRoleRights()
  rights: Partial<Record<ClanBasicRight, true>>;
}
