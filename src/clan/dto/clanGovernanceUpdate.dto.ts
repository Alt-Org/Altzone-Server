import { IsArray, IsOptional, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClanRoleDto } from '../role/dto/createClanRole.dto';

/**
 * DTO defining the shape of governance-related updates.
 */
export class ClanGovernanceUpdateDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClanRoleDto)
  roles?: CreateClanRoleDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  admin_ids?: string[];
}
