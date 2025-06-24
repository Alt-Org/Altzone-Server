import { ClanChatService } from '../../../chat/service/clanChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';

describe('ClanChatService.handleJoinChat', () => {
  let clanChatService: ClanChatService;

  beforeEach(async () => {
    clanChatService = await ChatModule.getClanChatService();
  });

  function createClient(clanId: string, playerId = 'player1'): WebSocketUser {
    return {
      user: {
        clanId,
        playerId,
      },
    } as unknown as WebSocketUser;
  }

  it('should create a new clan room and add the client if room does not exist', () => {
    const client = createClient('clanA');
    expect(clanChatService['clanRooms'].has('clanA')).toBe(false);

    clanChatService.handleJoinChat(client);

    expect(clanChatService['clanRooms'].has('clanA')).toBe(true);
    expect(clanChatService['clanRooms'].get('clanA')!.has(client)).toBe(true);
  });

  it('should add the client to an existing clan room', () => {
    const client1 = createClient('clanB', 'player1');
    const client2 = createClient('clanB', 'player2');

    clanChatService.handleJoinChat(client1);
    expect(clanChatService['clanRooms'].get('clanB')!.has(client1)).toBe(true);

    clanChatService.handleJoinChat(client2);
    expect(clanChatService['clanRooms'].get('clanB')!.has(client2)).toBe(true);
    expect(clanChatService['clanRooms'].get('clanB')!.size).toBe(2);
  });

  it('should not duplicate the client in the clan room', () => {
    const client = createClient('clanC');
    clanChatService.handleJoinChat(client);
    clanChatService.handleJoinChat(client);

    expect(clanChatService['clanRooms'].get('clanC')!.size).toBe(1);
  });
});
