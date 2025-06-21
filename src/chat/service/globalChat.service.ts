import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WebSocketUser } from '../types/WsUser.type';
import { ChatMessageDto } from '../dto/chatMessage.dto';
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

  handleJoinChat(client: WebSocketUser): void {
    this.connectedUsers.add(client);
  }

  handleDisconnect(client: WebSocketUser): void {
    this.connectedUsers.delete(client);
  }

  broadcast(message: ChatEnvelopeDto): void {
    this.connectedUsers.forEach((user) => {
      if (user && user.readyState === WebSocket.OPEN) {
        user.send(JSON.stringify(message));
      }
    });
  }

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
