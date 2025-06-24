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

export abstract class BaseChatService {
  constructor(protected readonly chatService: ChatService) {}

  /**
   * Handles the creation and broadcasting of a new chat message.
   *
   * Validates the incoming chat message, sends validation errors to the client if any,
   * creates the chat message using the chat service, and broadcasts the new message
   * to the specified recipients. If message creation fails, sends the error to the client.
   *
   * @param chatMessage - The DTO containing the new chat message data.
   * @param client - The WebSocket user who sent the message.
   * @param chatType - The type of chat (e.g., group, private).
   * @param recipients - The set of WebSocket users to broadcast the message to.
   */
  async handleNewMessage(
    chatMessage: CreateChatMessageDto,
    client: WebSocketUser,
    chatType: ChatType,
    recipients: Set<WebSocketUser>,
  ) {
    const errors = await validate(chatMessage);

    if (errors.length > 0) {
      client.send(
        JSON.stringify({ error: 'Validation failed', details: errors }),
      );
      return;
    }

    const [createdMsg, error] =
      await this.chatService.createChatMessage(chatMessage);

    if (error) {
      client.send(JSON.stringify({ error }));
      return;
    }

    const messageEnvelope: ChatEnvelopeDto = {
      chat: chatType,
      event: MessageEventType.NEW_MESSAGE,
      message: createdMsg,
    };

    this.broadcast(messageEnvelope, recipients);
  }

  /**
   * Broadcasts a chat message to a set of WebSocket recipients.
   *
   * Iterates over the provided recipients and sends the serialized message
   * to each recipient whose WebSocket connection is open and supports the `send` method.
   *
   * @param message The chat message envelope to broadcast.
   * @param recipients A set of WebSocket users to receive the message.
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
          recipient.readyState === WebSocket.OPEN &&
          typeof recipient.send === 'function'
        ) {
          recipient.send?.(JSON.stringify({ message: envelopeToSend }));
        }
      });
    }
  }

  /**
   * Handles reaction to a chat message.
   *
   * Adds the reaction to the message in DB
   * and broadcasts the updated message.
   * @param client
   * @param reaction
   * @returns
   */
  async handleNewReaction(
    client: WebSocketUser,
    reaction: AddReactionDto,
    recipients: Set<WebSocketUser>,
  ) {
    const [updatedMessage, error] = await this.chatService.addReaction(
      reaction.message_id,
      client.user.name,
      reaction.emoji,
    );

    if (error) {
      client.send(JSON.stringify({ error }));
      return;
    }

    const messageEnvelope: ChatEnvelopeDto = {
      chat: ChatType.CLAN,
      event: MessageEventType.NEW_REACTION,
      message: updatedMessage,
    };

    this.broadcast(messageEnvelope, recipients);
  }
}
