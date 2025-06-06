import { IsInt, IsMongoId } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('messageParam')
export class messageParam {
  /**
   * ID of the chat containing the message
   *
   * @example "665b1f29c3f4fa0012e7a911"
   */
  @IsMongoId()
  chat_id: string;

  /**
   * ID of the message to retrieve or modify
   *
   * @example 101
   */
  @IsInt()
  _id: number;
}

export class chat_idParam {
  /**
   * ID of the chat to operate on
   *
   * @example "665b1f29c3f4fa0012e7a911"
   */
  @IsMongoId()
  chat_id: string;
}
