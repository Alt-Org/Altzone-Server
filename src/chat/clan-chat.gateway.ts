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
import { ClanChatService } from './clanChat.service';
import { AddReactionDto } from './dto/addReaction.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly playerService: PlayerService,
    private readonly clanChatService: ClanChatService,
  ) {}

  async handleConnection(client: WebSocketUser) {
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
  }

  handleDisconnect(client: WebSocketUser) {
    this.clanChatService.handleDisconnect(client);
  }

  @SubscribeMessage('clanMessage')
  async handleClanMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: WebSocketUser,
  ) {
    await this.clanChatService.handleNewMessage(client, data.message);
  }

  @SubscribeMessage('clanMessageReaction')
  async handleClanMessageReaction(
    @MessageBody() reaction: AddReactionDto,
    @ConnectedSocket() client: WebSocketUser,
  ) {
    await this.clanChatService.handleNewReaction(client, reaction);
  }
}
