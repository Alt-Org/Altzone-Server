import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('ChatDto')
export class ChatDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  name?: string;
}
