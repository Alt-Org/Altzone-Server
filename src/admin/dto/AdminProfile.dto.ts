import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('AdminProfileDto')
export class AdminProfileDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  username: string;

  @Expose()
  isSystemAdmin: boolean;

  @Expose()
  environment?: number;
}
