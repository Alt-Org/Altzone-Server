import { GlobalChatService } from '../../../chat/service/globalChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';
import { WsMessageBodyDto } from '../../../chat/dto/wsMessageBody.dto';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';

describe('GlobalChatService.handleNewGlobalMessage() test suite', () => {
  let globalChatService: GlobalChatService;
  let mockHandleNewMessage: jest.SpyInstance;

  beforeEach(async () => {
    globalChatService = await ChatModule.getGlobalChatService();
    mockHandleNewMessage = jest
      .spyOn(globalChatService, 'handleNewMessage')
      .mockResolvedValue(undefined);
    globalChatService.connectedUsers.clear();
  });

  function createClient(playerId = 'player1'): WebSocketUser {
    return {
      user: {
        playerId,
      },
    } as unknown as WebSocketUser;
  }

  it('should call handleNewMessage with correct parameters and broadcast to all connected users', async () => {
    const client = createClient('player123');
    const message: WsMessageBodyDto = {
      content: 'Hello world!',
      feeling: 'excited',
    } as any;
    globalChatService.handleJoinChat(client);

    await globalChatService.handleNewGlobalMessage(message, client);

    expect(mockHandleNewMessage).toHaveBeenCalledTimes(1);
    const [chatMessage, calledClient, chatType, recipients] =
      mockHandleNewMessage.mock.calls[0];
    expect(chatMessage.type).toBe(ChatType.GLOBAL);
    expect(chatMessage.sender_id).toBe('player123');
    expect(chatMessage.content).toBe('Hello world!');
    expect(chatMessage.feeling).toBe('excited');
    expect(calledClient).toBe(client);
    expect(chatType).toBe(ChatType.GLOBAL);
    expect(recipients.has(client)).toBe(true);
  });

  it('should not throw if there are no connected users', async () => {
    const client = createClient('playerX');
    const message: WsMessageBodyDto = {
      content: 'Anyone here?',
      feeling: 'lonely',
    } as any;

    await expect(
      globalChatService.handleNewGlobalMessage(message, client),
    ).resolves.not.toThrow();
    expect(mockHandleNewMessage).toHaveBeenCalledWith(
      expect.objectContaining({ sender_id: 'playerX' }),
      client,
      ChatType.GLOBAL,
      expect.any(Set),
    );
  });
});
