import { IsMongoId, IsString } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('UpdateSoulHomeDto')
export class UpdateSoulHomeDto {
  /**
   * ID of the Soul Home to update
   *
   * @example "666fabc1d2f0e10012aabbcc"
   */
  @IsMongoId()
  _id: string;

  /**
   * Updated name for the Soul Home
   *
   * @example "Citadel of Light"
   */
  @IsString()
  name?: string;
}
