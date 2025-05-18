import { IsMongoId, IsString } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { ApiProperty } from '@nestjs/swagger';

@AddType('CreateSoulHomeDto')
export class CreateSoulHomeDto {
  /**
   * Name of the Soul Home
   *
   * @example "Sanctuary of Shadows"
   */
  @IsString()
  name: string;

  /**
   * ID of the clan that owns the Soul Home
   *
   * @example "666abc12d1e2f30012bbccdd"
   */
  @ApiProperty({ uniqueItems: true })
  @IsMongoId()
  clan_id: string;
}
