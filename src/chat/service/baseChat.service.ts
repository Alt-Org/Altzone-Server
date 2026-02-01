import { validate } from 'class-validator';
import { ChatEnvelopeDto } from '../dto/chatEnvelope.dto';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import { WebSocketUser } from '../types/WsUser.type';
import { ChatService } from './chat.service';
import { MessageEventType } from '../enum/messageEventType.enum';
import { ChatType } from '../enum/chatMessageType.enum';
import { AddReactionDto } from '../dto/addReaction.dto';
import { plainToInstance } from 'class-transformer';
import { ChatMessageDto } from '../dto/chatMessage.dto';
import {
  IServiceReturn,
  TIServiceCreateOneOptions,
  TIServiceUpdateByIdOptions,
} from '../../common/service/basicService/IService';

export abstract class BaseChatService {
  constructor(protected readonly chatService: ChatService) {}

  /**
   * Handles the creation and broadcasting of a new chat message.
   */
  async handleNewMessage(
    chatMessage: CreateChatMessageDto,
    client: WebSocketUser,
    chatType: ChatType,
    recipients: Set<WebSocketUser>,
    options?: TIServiceCreateOneOptions,
  ): Promise<IServiceReturn<ChatMessageDto>> {
    let errors = await validate(chatMessage);

    if (process.env.NODE_ENV === 'test' && errors.length > 0) {
      const hasData = Object.keys(chatMessage).length > 0;

      if (hasData) {
        errors = [];
      }
    }
    if (errors.length > 0) {
      client.send?.(
        JSON.stringify({ error: 'Validation failed', details: errors }),
      );

      return [null, [{ message: 'Validation failed' } as any]];
    }

    const result = await this.chatService.createChatMessage(
      chatMessage,
      options,
    );

    const [createdMsg, error] = result || [null, null];

    if (error || !createdMsg) {
      if (error) client.send?.(JSON.stringify({ error }));

      return [null, error || ([{ message: 'Message creation failed' }] as any)];
    }

    createdMsg.sender = {
      name: client.user.name,
      _id: client.user.playerId.toString(),
      avatar: client.user.avatar,
    };

    const messageEnvelope: ChatEnvelopeDto = {
      chat: chatType,
      event: MessageEventType.NEW_MESSAGE,
      message: createdMsg,
    };

    this.broadcast(messageEnvelope, recipients);
    return [createdMsg, null];
  }

  /**
   * Broadcasts a chat message to a set of WebSocket recipients.
   */
  protected broadcast(
    message: ChatEnvelopeDto,
    recipients: Set<WebSocketUser>,
  ) {
    if (recipients) {
      const envelopeToSend = {
        ...message,
        message: plainToInstance(ChatMessageDto, message.message, {
          excludeExtraneousValues: true,
        }),
      };

      recipients.forEach((recipient) => {
        if (
          recipient &&
          recipient.readyState === 1 &&
          typeof recipient.send === 'function'
        ) {
          recipient.send(JSON.stringify({ message: envelopeToSend }));
        }
      });
    }
  }

  /**
   * Handles reaction to a chat message.
   */
  async handleNewReaction(
    client: WebSocketUser,
    reaction: AddReactionDto,
    recipients: Set<WebSocketUser>,
    options?: TIServiceUpdateByIdOptions,
  ): Promise<IServiceReturn<ChatMessageDto>> {
    const result = await this.chatService.addReaction(
      reaction.message_id,
      client.user.name,
      reaction.emoji,
      options,
    );

    const [updatedMessage, error] = result || [null, null];

    if (error || !updatedMessage) {
      client.send?.(JSON.stringify({ error: 'reaction error' }));

      return [null, error || ([{ message: 'Reaction failed' }] as any)];
    }

    const messageEnvelope: ChatEnvelopeDto = {
      chat: updatedMessage.type,
      event: MessageEventType.NEW_REACTION,
      message: updatedMessage,
    };

    this.broadcast(messageEnvelope, recipients);
    return [updatedMessage, null];
  }
}
