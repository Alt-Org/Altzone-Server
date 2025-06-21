import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PlayerService } from '../player/player.service';
import { WebSocketUser } from './types/WsUser.type';
import { ClanChatService } from './service/clanChat.service';
import { AddReactionDto } from './dto/addReaction.dto';
import { WsMessageBodyDto } from './dto/wsMessageBody.dto';
import { envVars } from '../common/service/envHandler/envVars';

const apiPort = Number.parseInt(envVars.PORT, 10);

@WebSocketGateway(apiPort)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly playerService: PlayerService,
    private readonly clanChatService: ClanChatService,
    private readonly globalChatService: GlobalChatService,
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
    const clanId = player.clan_id.toString();
    client.user = {
      playerId,
      clanId,
      name: player.name,
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
  async handleClanMessage(
    @MessageBody() message: WsMessageBodyDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    await this.clanChatService.handleNewMessage(client, message);
  }

  @SubscribeMessage('clanMessageReaction')
  async handleClanMessageReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    await this.clanChatService.handleNewReaction(client, reaction);
  }

  @SubscribeMessage('globalMessage')
  async handleGlobalMessage(
    @MessageBody() message: WsMessageBodyDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    await this.globalChatService.handleNewMessage(message, client);
  }
}
