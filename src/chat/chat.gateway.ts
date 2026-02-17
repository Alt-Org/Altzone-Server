import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { PlayerService } from '../player/player.service';
import { WebSocketUser } from './types/WsUser.type';
import { ClanChatService } from './service/clanChat.service';
import { AddReactionDto } from './dto/addReaction.dto';
import { WsMessageBodyDto } from './dto/wsMessageBody.dto';
import { envVars } from '../common/service/envHandler/envVars';
import { GlobalChatService } from './service/globalChat.service';
import { UseFilters } from '@nestjs/common';
import { GlobalWsExceptionFilter } from './decorator/wsExceptionFilter.decorator';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import { WsLog } from '../common/service/logger/WsLog.decorator';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import {
  initializeSession,
  cancelTransaction,
  endTransaction,
} from '../common/function/Transactions';
import { ChatMessageDto } from './dto/chatMessage.dto';
import { IServiceReturn } from 'src/common/service/basicService/IService';

const apiPort = Number.parseInt(envVars.PORT, 10);

@WebSocketGateway(apiPort)
@UseFilters(GlobalWsExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly playerService: PlayerService,
    private readonly clanChatService: ClanChatService,
    private readonly globalChatService: GlobalChatService,
    private readonly emitterService: EventEmitterService,
  ) { }

  /**
   * Handles a new WebSocket client connection.
   *
   * Retrieves the player's information using the player ID from the client's token.
   * If the player is found, attaches user details to the client object.
   *
   * @param client The WebSocket client attempting to connect.
   */
  async handleConnection(client: WebSocketUser): Promise<void> {
    const playerId = client['token']['player_id'];
    const [player, error] = await this.playerService.getPlayerById(playerId);
    if (error) {
      client.send?.(JSON.stringify({ error: 'Error finding player data' }));
      client.close?.();
      return;
    }
    const clanId = player.clan_id?.toString();
    client.user = {
      playerId,
      clanId,
      name: player.name,
      avatar: player.avatar,
    };

    this.clanChatService.handleJoinChat(client);
    this.globalChatService.handleJoinChat(client);
  }

  /**
   * Handles the disconnection of a WebSocket client.
   *
   * @param client - The WebSocket client that has disconnected.
   */
  handleDisconnect(client: WebSocketUser) {
    this.clanChatService.handleDisconnect(client);
    this.globalChatService.handleDisconnect(client);
  }

  @SubscribeMessage('clanMessage')
  @WsLog()
  async handleClanMessage(
    @MessageBody() message: WsMessageBodyDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [_, error] = await this.clanChatService.handleNewClanMessage(client, message);

    if (error) return [null, error];

    this.emitterService.EmitNewDailyTaskEvent(
      client.user.playerId,
      ServerTaskName.WRITE_CHAT_MESSAGE_CLAN,
    );
  }

  @SubscribeMessage('clanMessageReaction')
  @WsLog()
  async handleClanMessageReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [updatedMessage, error] =
      await this.clanChatService.handleNewClanReaction(client, reaction, {
        session,
      });

    if (error) return cancelTransaction(session, error);

    const [_, endError] = await endTransaction(session, updatedMessage);
    if (endError) return [null, endError];
  }

  @SubscribeMessage('globalMessage')
  @WsLog()
  async handleGlobalMessage(
    @MessageBody() message: WsMessageBodyDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [_, error] = await this.globalChatService.handleNewGlobalMessage(message, client);

    if (error) return [null, error];

    this.emitterService.EmitNewDailyTaskEvent(
      client.user.playerId,
      ServerTaskName.WRITE_CHAT_MESSAGE_GLOBAL,
    );
  }

  @SubscribeMessage('globalMessageReaction')
  @WsLog()
  async handleGlobalReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [updatedMessage, error] =
      await this.globalChatService.handleNewGlobalReaction(client, reaction, {
        session,
      });

    if (error) return cancelTransaction(session, error);

    const [_, endError] = await endTransaction(session, updatedMessage);
    if (endError) return [null, endError];
  }
}
