import { IsDefined, IsEnum } from 'class-validator';
import { ChatEmotion } from '../enum/chatEmotion.enum';
import { ChatResponseType } from '../enum/chatResponseType.enum';

/**
 * DTO representing message body of incoming websocket chat messages.
 */
export class WsMessageBodyDto {
  /**
   * Predefined response selected by the player.
   */
  @IsDefined()
  @IsEnum(ChatResponseType)
  responseType: ChatResponseType;

  /**
   * Emotion selected for a predefined response.
   */
  @IsDefined()
  @IsEnum(ChatEmotion)
  emotion: ChatEmotion;
}
