import { ClanChatService } from '../../../chat/service/clanChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';

describe('ClanChatService.handleDisconnect', () => {
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

  it('should remove the client from the clan room', () => {
    clanChatService.clanRooms.set('clanA', new Set());
    const room = clanChatService.clanRooms.get('clanA');
    room.add(createClient('clanA', 'player420'));

    const client = createClient('clanA');
    clanChatService.handleJoinChat(client);
    expect(clanChatService.clanRooms.get('clanA')!.has(client)).toBe(true);

    clanChatService.handleDisconnect(client);

    expect(clanChatService.clanRooms.get('clanA').has(client)).toBe(false);
  });

  it('should delete the clan room if it becomes empty after disconnect', () => {
    const client = createClient('clanB');
    clanChatService.handleJoinChat(client);
    expect(clanChatService.clanRooms.has('clanB')).toBe(true);

    clanChatService.handleDisconnect(client);

    expect(clanChatService.clanRooms.has('clanB')).toBe(false);
  });

  it('should only remove the specified client and keep others in the room', () => {
    const client1 = createClient('clanC', 'player1');
    const client2 = createClient('clanC', 'player2');
    clanChatService.handleJoinChat(client1);
    clanChatService.handleJoinChat(client2);

    clanChatService.handleDisconnect(client1);

    expect(clanChatService.clanRooms.get('clanC')!.has(client1)).toBe(false);
    expect(clanChatService.clanRooms.get('clanC')!.has(client2)).toBe(true);
    expect(clanChatService.clanRooms.has('clanC')).toBe(true);
  });

  it('should do nothing if the client is not in any clan room', () => {
    const client = createClient('clanD');
    expect(() => clanChatService.handleDisconnect(client)).not.toThrow();
    expect(clanChatService.clanRooms.has('clanD')).toBe(false);
  });
});
