import { Expose, Type } from 'class-transformer';
import { ReactionDto } from './reaction.dto';

export class ChatMessageDto {
  /**
   * Unique ID of the chat message
   * @example "665f7c2d9a2d3c7b7e56d01df"
   */
  @Expose()
  id: string;

  /**
   * ID of the clan this message belongs to
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @Expose()
  clan_id: string;

  /**
   * ID of the player who sent the message
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @Expose()
  sender_id: string;

  /**
   * Name of the player who sent the message
   * @example "ShadowKnight"
   */
  @Expose()
  senderName: string;

  /**
   * Content of the chat message
   * @example "Let's attack the north gate!"
   */
  @Expose()
  content: string;

  /**
   * Type of the chat message
   * @example "clan"
   */
  @Expose()
  type: string;

  /**
   * ID of the recipient (for private messages)
   * @example "60d21b4667d0d8992e610c85"
   */
  @Expose()
  recipient_id?: string;

  /**
   * List of reactions to this message
   */
  @Expose()
  @Type(() => ReactionDto)
  reactions: ReactionDto[];

  /**
   * Timestamp when the message was created
   * @example "2024-06-19T12:34:56.789Z"
   */
  @Expose()
  createdAt: Date;
}
