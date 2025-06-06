import { IsInt, IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('CreateMessageDto')
export class CreateMessageDto {
  /**
   * Unique numeric message ID within the chat
   *
   * @example 101
   */
  @IsInt()
  id: number;

  /**
   * Username of the player sending the message
   *
   * @example "ShadowKnight"
   */
  @IsString()
  senderUsername: string;

  /**
   * Text content of the message
   *
   * @example "Let’s meet at Soul Arena!"
   */
  @IsString()
  content: string;

  /**
   * Numeric code representing the emotion or tone (e.g., happy, angry)
   *
   * @example 3
   */
  @IsInt()
  feeling: number;
}
