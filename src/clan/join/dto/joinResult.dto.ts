import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';

@AddType('JoinResultDto')
export class JoinResultDto {
  /**
   * ID of the join request
   * @example "665fa038b4b74d098aac4e77"
   */
  @IsMongoId()
  _id: string;

  /**
   * Indicates whether the join request has been accepted
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  accepted: boolean;
}
