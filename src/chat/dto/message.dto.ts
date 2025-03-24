import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('MessageDto')
export class MessageDto {
  @Expose()
  id: number;

  @Expose()
  senderUsername: string;

  @Expose()
  content: string;

  @Expose()
  feeling: number;
}
