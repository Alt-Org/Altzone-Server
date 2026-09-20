import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Feeling } from '../enum/feeling.enum';
import { ChatEmotion } from '../enum/chatEmotion.enum';
import { ChatResponseType } from '../enum/chatResponseType.enum';

/**
 * DTO representing message body of incoming websocket chat messages.
 */
export class WsMessageBodyDto {
  /**
   * The message content.
   * @example "Hello there!"
   */
  @IsString()
  content: string;

  /**
   * Feeling of the message.
   * @example "Happy"
   */
  @IsOptional()
  @IsEnum(Feeling)
  feeling?: Feeling;

  /**
   * Predefined response selected by the player.
   */
  @IsOptional()
  @IsEnum(ChatResponseType)
  responseType?: ChatResponseType;

  /**
   * Emotion selected for a predefined response.
   */
  @IsOptional()
  @IsEnum(ChatEmotion)
  emotion?: ChatEmotion;
}
