import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WebSocketUser } from '../types/WsUser.type';
import { MessageEventType } from '../enum/messageEventType.enum';
import { WebSocket } from 'ws';
import { WsMessageBodyDto } from '../dto/wsMessageBody.dto';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import { ChatType } from '../enum/chatMessageType.enum';
import { validate } from 'class-validator';
import { ChatEnvelopeDto } from '../dto/chatEnvelope.dto';

@Injectable()
export class GlobalChatService {
  constructor(private readonly chatService: ChatService) {}

  connectedUsers = new Set<WebSocketUser>();

  /**
   * Adds the client to the set of connected users.
   *
   * @param client - The WebSocket user joining the chat.
   */
  handleJoinChat(client: WebSocketUser): void {
    this.connectedUsers.add(client);
  }

  /**
   * Removes the client from the set of connected users.
   * @param client - The WebSocket user leaving the chat.
   */
  handleDisconnect(client: WebSocketUser): void {
    this.connectedUsers.delete(client);
  }

  /**
   * Sends a message to all connected users.
   * @param message - Message content to be sent.
   */
  broadcast(message: ChatEnvelopeDto): void {
    this.connectedUsers.forEach((user) => {
      if (
        user &&
        user.readyState === WebSocket.OPEN &&
        typeof user.send === 'function'
      ) {
        user.send?.(JSON.stringify(message));
      }
    });
  }

  /**
   * Handles a new incoming chat message from a client in the global chat.
   *
   * Validates the incoming message payload, sends validation errors back to the client if any.
   * Attempts to create a new chat message using the chat service.
   * Broadcasts the new message to all connected clients.
   *
   * @param message - The incoming message data from the client.
   * @param client - The WebSocket client sending the message.
   */
  async handleNewMessage(message: WsMessageBodyDto, client: WebSocketUser) {
    const chatMessage = new CreateChatMessageDto({
      type: ChatType.GLOBAL,
      sender_id: client.user.playerId,
      content: message.content,
      feeling: message.feeling,
    });

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
      client.send(JSON.stringify({ error: 'Message not created' }));
      return;
    }

    const messageEnvelope: ChatEnvelopeDto = {
      chat: ChatType.GLOBAL,
      event: MessageEventType.NEW_MESSAGE,
      message: createdMsg,
    };
    this.broadcast(messageEnvelope);
  }
}
