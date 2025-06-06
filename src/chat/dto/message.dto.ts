import { Expose } from 'class-transformer';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('MessageDto')
export class MessageDto {
  /**
   * Unique message ID within the chat
   *
   * @example 101
   */
  @Expose()
  id: number;

  /**
   * Username of the message sender
   *
   * @example "SkyBlade"
   */
  @Expose()
  senderUsername: string;

  /**
   * Message text sent by the player
   *
   * @example "We captured the room!"
   */
  @Expose()
  content: string;

  /**
   * Feeling code representing the tone of the message
   *
   * @example 1
   */
  @Expose()
  feeling: number;
}
