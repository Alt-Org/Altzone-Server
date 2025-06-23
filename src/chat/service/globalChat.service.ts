import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WebSocketUser } from '../types/WsUser.type';
import { WsMessageBodyDto } from '../dto/wsMessageBody.dto';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import { ChatType } from '../enum/chatMessageType.enum';
import { BaseChatService } from './baseChat.service';
import { AddReactionDto } from '../dto/addReaction.dto';

@Injectable()
export class GlobalChatService extends BaseChatService {
  constructor(protected readonly chatService: ChatService) {
    super(chatService);
  }

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
   * Handles a new incoming chat message from a client in the global chat.
   *
   * Delegates the message processing to a generic handler with a list of all connected users.
   *
   * @param message - The incoming message data from the client.
   * @param client - The WebSocket client sending the message.
   */
  async handleNewGlobalMessage(
    message: WsMessageBodyDto,
    client: WebSocketUser,
  ) {
    const chatMessage = new CreateChatMessageDto({
      type: ChatType.GLOBAL,
      sender_id: client.user.playerId,
      content: message.content,
      feeling: message.feeling,
    });

    await this.handleNewMessage(
      chatMessage,
      client,
      ChatType.GLOBAL,
      this.connectedUsers,
    );
  }

  /**
   * Handles the addition of a new reaction to global chat message.
   * Delegates the reaction processing to the generic handler with the list of all connected users.
   *
   * @param client - The WebSocket user who is adding the reaction.
   * @param reaction - The reaction data to be added.
   * @returns A promise that resolves when the reaction has been processed.
   */
  async handleNewGlobalReaction(
    client: WebSocketUser,
    reaction: AddReactionDto,
  ) {
    await this.handleNewReaction(client, reaction, this.connectedUsers);
  }
}
