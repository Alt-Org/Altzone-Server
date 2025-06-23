import { ClanChatService } from '../../../chat/service/clanChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';
import { WsMessageBodyDto } from '../../../chat/dto/wsMessageBody.dto';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';

describe('ClanChatService.handleNewClanMessage() test suite', () => {
  let clanChatService: ClanChatService;
  let mockHandleNewMessage: jest.SpyInstance;

  beforeEach(async () => {
    clanChatService = await ChatModule.getClanChatService();
    mockHandleNewMessage = jest
      .spyOn(clanChatService, 'handleNewMessage')
      .mockResolvedValue(undefined);
    clanChatService.clanRooms.clear();
  });

  function createClient(clanId: string, playerId = 'player1'): WebSocketUser {
    return {
      user: {
        clanId,
        playerId,
      },
    } as unknown as WebSocketUser;
  }

  it('should call handleNewMessage with correct parameters and broadcast to clan room', async () => {
    const client = createClient('clanA', 'player123');
    const message: WsMessageBodyDto = {
      content: 'Hello clan!',
      feeling: 'happy',
    } as any;
    clanChatService.handleJoinChat(client);

    await clanChatService.handleNewClanMessage(client, message);

    expect(mockHandleNewMessage).toHaveBeenCalledTimes(1);
    const [chatMessage, calledClient, chatType, recipients] =
      mockHandleNewMessage.mock.calls[0];
    expect(chatMessage.type).toBe(ChatType.CLAN);
    expect(chatMessage.clan_id).toBe('clanA');
    expect(chatMessage.sender_id).toBe('player123');
    expect(chatMessage.content).toBe('Hello clan!');
    expect(chatMessage.feeling).toBe('happy');
    expect(calledClient).toBe(client);
    expect(chatType).toBe(ChatType.CLAN);
    expect(recipients.has(client)).toBe(true);
  });

  it('should not throw if clan room does not exist', async () => {
    const client = createClient('clanB', 'playerX');
    const message: WsMessageBodyDto = {
      content: 'No one here',
      feeling: 'sad',
    } as any;

    await expect(
      clanChatService.handleNewClanMessage(client, message),
    ).resolves.not.toThrow();
    expect(mockHandleNewMessage).toHaveBeenCalledWith(
      expect.objectContaining({ clan_id: 'clanB', sender_id: 'playerX' }),
      client,
      ChatType.CLAN,
      undefined,
    );
  });
});
