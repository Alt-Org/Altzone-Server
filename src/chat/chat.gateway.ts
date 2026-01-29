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
import { Logger, UseFilters } from '@nestjs/common';
import { GlobalWsExceptionFilter } from './decorator/wsExceptionFilter.decorator';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import { RequestLoggerService } from '../common/service/logger/RequestLogger.service';
import { WsLog } from '../common/service/logger/WsLog.decorator';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import { initializeSession, cancelTransaction, endTransaction } from '../common/function/Transactions';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';

const apiPort = Number.parseInt(envVars.PORT, 10);

@WebSocketGateway(apiPort)
@UseFilters(GlobalWsExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly playerService: PlayerService,
    private readonly clanChatService: ClanChatService,
    private readonly globalChatService: GlobalChatService,
    private readonly requestLoggerService: RequestLoggerService,
    private readonly emitterService: EventEmitterService,
  ) {}

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
async handleNewClanMessage(
  @MessageBody() message: WsMessageBodyDto,
  @ConnectedSocket() client: WebSocketUser,
) {

  const [session, sessionError] = await initializeSession(this.connection);
  if (sessionError) return [null, sessionError];
  
  try {
    const [, error] = await this.clanChatService.handleNewClanMessage(client, message, { session });
    if (error) return await cancelTransaction(session, error);

    this.emitterService.EmitNewDailyTaskEvent(
      client.user.playerId,
      ServerTaskName.WRITE_CHAT_MESSAGE_CLAN,
    );

    return await endTransaction(session);
  } catch (err) {
    return await cancelTransaction(session, new ServiceError({
        reason: SEReason.UNEXPECTED,
        message: err instanceof Error ? err.message : 'Clan message failed',
        value: err
    }));
  }
}

  @SubscribeMessage('clanMessageReaction')
  @WsLog()
  async handleNewClanReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    try {
      await this.clanChatService.handleNewClanReaction(client, reaction, { session } as any);
      return await endTransaction(session);
    } catch (err) {
      return await cancelTransaction(session, new ServiceError({
          reason: SEReason.UNEXPECTED,
          message: err instanceof Error ? err.message : 'Clan reaction failed',
          value: err
      }));
    }
  }

  @SubscribeMessage('globalMessage')
  async handleNewGlobalMessage(
    @MessageBody() message: WsMessageBodyDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    try {

      await this.globalChatService.handleNewGlobalMessage(message, client, { session });
      
      this.emitterService.EmitNewDailyTaskEvent(
        client.user.playerId,
        ServerTaskName.WRITE_CHAT_MESSAGE_GLOBAL,
      );

      return await endTransaction(session);
    } catch (err) {
      return await cancelTransaction(session, new ServiceError({
          reason: SEReason.UNEXPECTED,
          message: err instanceof Error ? err.message : 'Global message failed',
          value: err
      }));
    }
  }

  @SubscribeMessage('globalMessageReaction')
  async handleNewGlobalReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    const [session, sessionError] = await initializeSession(this.connection);
    if (sessionError) return [null, sessionError];

    try {
      
      await this.globalChatService.handleNewGlobalReaction(client, reaction, { session } as any);

      return await endTransaction(session);
    } catch (err) {
      return await cancelTransaction(session, new ServiceError({
          reason: SEReason.UNEXPECTED,
          message: err instanceof Error ? err.message : 'Global reaction failed',
          value: err
      }));
    }
  }
}
