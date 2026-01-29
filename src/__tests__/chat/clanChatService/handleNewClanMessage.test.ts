import { ClanChatService } from '../../../chat/service/clanChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';
import { WsMessageBodyDto } from '../../../chat/dto/wsMessageBody.dto';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import { ChatService } from '../../../chat/service/chat.service'; // ADDED

describe('ClanChatService.handleNewClanMessage() test suite', () => {
  let clanChatService: ClanChatService;
  let chatService: ChatService; // ADDED
  let mockCreateChatMessage: jest.SpyInstance;

  beforeEach(async () => {
    clanChatService = await ChatModule.getClanChatService();
    chatService = clanChatService['chatService'];
    
    
    mockCreateChatMessage = jest
      .spyOn(chatService, 'createChatMessage')
      .mockResolvedValue([{} as any, null]); 
      
    clanChatService['clanRooms'].clear();
  });

  function createClient(clanId: string, playerId = 'player1'): WebSocketUser {
    return {
      user: {
        clanId,
        playerId,
        name: 'TestPlayer',
      },
    } as unknown as WebSocketUser;
  }

  it('should call chatService.createChatMessage with correct parameters', async () => {
    const client = createClient('clanA', 'player123');
    const message: WsMessageBodyDto = {
      content: 'Hello clan!',
      feeling: 'happy',
    } as any;
    
    await clanChatService.handleNewClanMessage(client, message);

    // MODIFIED: Check that the service was called once
    expect(mockCreateChatMessage).toHaveBeenCalledTimes(1);
    
    // MODIFIED: Check the arguments passed to the DB service
    const [dto, options] = mockCreateChatMessage.mock.calls[0];
    
    expect(dto.type).toBe(ChatType.CLAN);
    expect(dto.clan_id).toBe('clanA');
    expect(dto.sender_id).toBe('player123');
    expect(dto.content).toBe('Hello clan!');
    expect(dto.feeling).toBe('happy');
    
    // MODIFIED: Verify the 3rd argument is undefined (no session passed in test)
    expect(options).toBeUndefined();
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

    // MODIFIED: Update the expectation to match the direct service call
    expect(mockCreateChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ clan_id: 'clanB', sender_id: 'playerX' }),
      undefined,
    );
  });
});