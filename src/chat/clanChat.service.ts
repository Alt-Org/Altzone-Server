import { Injectable } from '@nestjs/common';
import { WebSocketUser } from './types/WsUser.type';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/createMessage.dto';
import { chatMessageType } from './enum/chatMessageType.enum';
import { validate } from 'class-validator';
import { ChatMessageDto } from './dto/chatMessage.dto';
import { AddReactionDto } from './dto/addReaction.dto';
import { MessageEventType } from './enum/messageEventType.enum';

@Injectable()
export class ClanChatService {
  constructor(private readonly chatService: ChatService) {}
  clanRooms = new Map<string, Set<WebSocketUser>>();

  handleJoinChat(client: WebSocketUser) {
    const clanId = client.user.clanId;
    if (!this.clanRooms.has(clanId)) {
      this.clanRooms.set(clanId, new Set());
    }
    const room = this.clanRooms.get(clanId);

    room.add(client);
  }

  handleDisconnect(client: WebSocketUser) {
    const clanId = client.user?.clanId;

    if (this.clanRooms.has(clanId)) {
      this.clanRooms.get(clanId)!.delete(client);
      if (this.clanRooms.get(clanId)!.size === 0) {
        this.clanRooms.delete(clanId);
      }
    }
  }

  async handleNewMessage(client: WebSocketUser, message: string) {
    const chatMessage = new CreateChatMessageDto({
      type: chatMessageType.CLAN,
      clan_id: client.user.clanId,
      sender_id: client.user.playerId,
      content: message,
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

    this.broadcast(
      createdMsg,
      client.user.clanId,
      MessageEventType.NEW_MESSAGE,
    );
  }

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

    this.broadcast(
      updatedMessage,
      client.user.clanId,
      MessageEventType.NEW_REACTION,
    );
  }

  private broadcast(
    message: ChatMessageDto,
    clanId: string,
    event: MessageEventType,
  ) {
    const recipients = this.clanRooms.get(clanId);
    if (recipients) {
      recipients.forEach((recipient) => {
        recipient.send(JSON.stringify({ event, message }));
      });
    }
  }
}
