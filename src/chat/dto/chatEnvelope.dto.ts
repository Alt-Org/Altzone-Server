import { IsEnum } from 'class-validator';
import { ChatType } from '../enum/chatMessageType.enum';
import { MessageEventType } from '../enum/messageEventType.enum';
import { ChatMessageDto } from './chatMessage.dto';
import { Type } from 'class-transformer';

export class ChatEnvelopeDto {
  /**
   * What chat is message sent to.
   *
   * @example 'clan'
   */
  @IsEnum(ChatType)
  chat: ChatType;

  /**
   * Type of the message.
   *
   * @example 'newMessage'
   */
  @IsEnum(MessageEventType)
  event: MessageEventType;

  /**
   * Represents a chat message within the envelope.
   *
   * @example
   * envelope.message = {
   *   id: '123',
   *   content: 'Hello, world!',
   *   senderId: 'user1',
   *   timestamp: new Date(),
   * };
   */
  @Type(() => ChatMessageDto)
  message: ChatMessageDto;
}
