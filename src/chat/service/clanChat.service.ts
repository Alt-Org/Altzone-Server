import { Injectable } from '@nestjs/common';
import { WebSocketUser } from '../types/WsUser.type';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import { ChatType } from '../enum/chatMessageType.enum';
import { AddReactionDto } from '../dto/addReaction.dto';
import { WsMessageBodyDto } from '../dto/wsMessageBody.dto';
import { BaseChatService } from './baseChat.service';

@Injectable()
export class ClanChatService extends BaseChatService {
  constructor(protected readonly chatService: ChatService) {
    super(chatService);
  }

  private readonly clanRooms = new Map<string, Set<WebSocketUser>>();

  /**
   * Adds the user to clan chat room.
   *
   * Based on the clan ID of the client creates a chat room
   * for the clan if it does not yet exist
   * and adds the client to that room.
   *
   * @param client - The connected WebSocket user
   */
  handleJoinChat(client: WebSocketUser): void {
    const clanId = client.user.clanId;
    if (!this.clanRooms.has(clanId)) {
      this.clanRooms.set(clanId, new Set());
    }
    const room = this.clanRooms.get(clanId);

    room.add(client);
  }

  /**
   * Handles the disconnection of a WebSocket user from a clan chat room.
   *
   * Removes the client from the corresponding clan room. If the clan room becomes empty
   * after the client is removed, the clan room is deleted from the collection.
   *
   * @param client - The WebSocket user that has disconnected.
   */
  handleDisconnect(client: WebSocketUser) {
    const clanId = client.user?.clanId;

    if (this.clanRooms.has(clanId)) {
      this.clanRooms.get(clanId)!.delete(client);
      if (this.clanRooms.get(clanId)!.size === 0) {
        this.clanRooms.delete(clanId);
      }
    }
  }

  /**
   * Handles a new message sent through WebSocket connection.
   *
   * Validates the message data.
   * Creates a new message in the DB.
   * Broadcasts the message.
   *
   * @param client
   * @param message
   */
  async handleNewClanMessage(client: WebSocketUser, message: WsMessageBodyDto) {
    const chatMessage = new CreateChatMessageDto({
      type: ChatType.CLAN,
      clan_id: client.user.clanId,
      sender_id: client.user.playerId,
      content: message.content,
      feeling: message.feeling,
    });

    const recipients = this.clanRooms.get(client.user?.clanId);

    await this.handleNewMessage(chatMessage, client, ChatType.CLAN, recipients);
  }

  /**
   * Removes the player from clan chat room.
   *
   * If player leaves a clan but doesn't disconnect from WebSocket
   * this method should be called to remove that player from the clan chat room.
   *
   * If room is empty after removing the player the room is deleted.
   *
   * @param playerId - ID of the player to remove.
   * @param clanId - Clan ID of the player to remove.
   */
  handleLeaveClan(playerId: string, clanId: string) {
    const room = this.clanRooms.get(clanId);
    if (room) {
      for (const client of room) {
        if (client.user && client.user.playerId === playerId) {
          room.delete(client);
          client.user.clanId = undefined;
          break;
        }
      }
      if (room.size === 0) {
        this.clanRooms.delete(clanId);
      }
    }
  }

  /**
   * Handles the addition of a new reaction for clan chat message.
   *
   * Retrieves the list of recipients in the clan room associated with the client,
   * and delegates the reaction handling to the generic reaction handler.
   *
   * @param client - The WebSocket user initiating the reaction.
   * @param reaction - The reaction data to be added.
   * @returns A promise that resolves when the reaction has been processed.
   */
  async handleNewClanReaction(
    client: WebSocketUser,
    reaction: AddReactionDto,
  ): Promise<void> {
    const recipients = this.clanRooms.get(client.user?.clanId);
    await this.handleNewReaction(client, reaction, recipients);
  }
}
