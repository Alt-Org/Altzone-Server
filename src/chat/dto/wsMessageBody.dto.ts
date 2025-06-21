import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Feeling } from '../enum/feeling.enum';

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
}
