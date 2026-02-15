import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ChatType } from '../enum/chatMessageType.enum';
import { Feeling } from '../enum/feeling.enum';
import { ObjectId } from 'mongodb';
import { IsMongoIdOrObjectId } from '../decorator/isMongoIdOrObjectId.decorator';

export class CreateChatMessageDto {
  constructor(partial: Partial<CreateChatMessageDto>) {
    Object.assign(this, partial);
  }
  /**
   * Specifies the type of the chat message.
   *
   * @example "clan"
   */
  @IsEnum(ChatType)
  type: ChatType;

  /**
   * ID of the message sender
   *
   * @example "60f7c2d9a2d3c7b7e56d01df"
   */
  @IsNotEmpty()
  @IsMongoIdOrObjectId()
  sender_id: string | ObjectId;

  /**
   * Text content of the message.
   * Content must not exceed 64 characters
   *
   * @example "Let’s meet at Soul Arena!"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  content: string;

  /**
   * ID of the clan.
   * Required when the message type is 'clan'.
   *
   * @example "60d21b4667d0d8992e610c85"
   */
  @ValidateIf((o) => o.type === ChatType.CLAN)
  @IsNotEmpty({ message: 'clan_id must be provided for clan messages' })
  @IsMongoIdOrObjectId()
  clan_id?: string | ObjectId;

  /**
   * ID of the recipient.
   * Required when the message type is 'private'.
   *
   * @example "60d21b4667d0d8992e610c85"
   */
  @ValidateIf((o) => o.type === ChatType.PRIVATE)
  @IsNotEmpty({ message: 'recipient_id must be provided for private messages' })
  @IsMongoIdOrObjectId()
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
