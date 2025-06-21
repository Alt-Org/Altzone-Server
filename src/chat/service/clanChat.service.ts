import { Injectable } from '@nestjs/common';
import { WebSocketUser } from '../types/WsUser.type';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from '../dto/createMessage.dto';
import { ChatType } from '../enum/chatMessageType.enum';
import { validate } from 'class-validator';
import { AddReactionDto } from '../dto/addReaction.dto';
import { MessageEventType } from '../enum/messageEventType.enum';
import { WsMessageBodyDto } from '../dto/wsMessageBody.dto';
import { WebSocket } from 'ws';
import { ChatEnvelopeDto } from '../dto/chatEnvelope.dto';

@Injectable()
export class ClanChatService {
  constructor(private readonly chatService: ChatService) {}

  clanRooms = new Map<string, Set<WebSocketUser>>();

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
  async handleNewMessage(
    client: WebSocketUser,
    message: WsMessageBodyDto,
  ): Promise<void> {
    const chatMessage = new CreateChatMessageDto({
      type: ChatType.CLAN,
      clan_id: client.user.clanId,
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
      chat: ChatType.CLAN,
      event: MessageEventType.NEW_MESSAGE,
      message: createdMsg,
    };

    this.broadcast(messageEnvelope, client.user.clanId);
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
          break;
        }
      }
      if (room.size === 0) {
        this.clanRooms.delete(clanId);
      }
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
  async handleNewReaction(client: WebSocketUser, reaction: AddReactionDto) {
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

    this.broadcast(messageEnvelope, client.user.clanId);
  }

  /**
   * Broadcasts a chat message to all recipients in the specified clan room.
   *
   * @param message - The chat message to send to recipients.
   * @param clanId - The unique identifier of the clan whose members will receive the message.
   * @param event - The type of chat event being broadcasted.
   */
  private broadcast(message: ChatEnvelopeDto, clanId: string) {
    const recipients = this.clanRooms.get(clanId);
    if (recipients) {
      recipients.forEach((recipient) => {
        if (
          recipient &&
          recipient.readyState === WebSocket.OPEN &&
          typeof recipient.send === 'function'
        )
          recipient.send(JSON.stringify(message));
      });
    }
  }
}
