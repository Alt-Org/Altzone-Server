import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ChatType } from '../enum/chatMessageType.enum';
import { Feeling } from '../enum/feeling.enum';
import { ObjectId } from 'mongodb';

export class UpdateChatMessageDto {
  constructor(partial: Partial<UpdateChatMessageDto>) {
    Object.assign(this, partial);
  }

  /**
   * ID of the chatmessage.
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @IsMongoId()
  _id: string;

  /**
   * Specifies the type of the chat message.
   *
   * @example "clan"
   */
  @IsEnum(ChatType)
  type?: ChatType;

  /**
   * ID of the message sender
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @IsMongoId()
  sender_id?: string | ObjectId;

  /**
   * Text content of the message
   *
   * @example "Let’s meet at Soul Arena!"
   */
  @IsString()
  @IsNotEmpty()
  content: string;

  /**
   * ID of the clan.
   * Required when the message type is 'clan'.
   *
   * @example "60d21b4667d0d8992e610c85"
   */
  @ValidateIf((o) => o.type === ChatType.CLAN)
  @IsNotEmpty({ message: 'clan_id must be provided for clan messages' })
  @IsMongoId()
  clan_id?: string;

  /**
   * ID of the recipient.
   * Required when the message type is 'private'.
   *
   * @example "60d21b4667d0d8992e610c85"
   */
  @ValidateIf((o) => o.type === ChatType.PRIVATE)
  @IsNotEmpty({ message: 'recipient_id must be provided for private messages' })
  @IsMongoId()
  recipient_id?: string;

  /**
   * Feeling of the message.
   *
   * @example "Happy"
   */
  @IsEnum(Feeling)
  @IsOptional()
  feeling?: Feeling;
}
