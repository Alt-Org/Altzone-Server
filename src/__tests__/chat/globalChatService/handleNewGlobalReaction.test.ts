import { GlobalChatService } from '../../../chat/service/globalChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';
import { AddReactionDto } from '../../../chat/dto/addReaction.dto';

describe('GlobalChatService.handleNewGlobalReaction() test suite', () => {
  let globalChatService: GlobalChatService;
  let mockHandleNewReaction: jest.SpyInstance;

  beforeEach(async () => {
    globalChatService = await ChatModule.getGlobalChatService();
    mockHandleNewReaction = jest
      .spyOn(globalChatService, 'handleNewReaction')
      .mockResolvedValue(undefined);
    globalChatService.connectedUsers.clear();
  });

  function createClient(playerId = 'player1'): WebSocketUser {
    return {
      user: {
        playerId,
        name: playerId,
      },
    } as unknown as WebSocketUser;
  }

  it('should call handleNewReaction with correct parameters and broadcast to all connected users', async () => {
    const client = createClient('player123');
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;
    globalChatService.handleJoinChat(client);

    await globalChatService.handleNewGlobalReaction(client, reaction);

    expect(mockHandleNewReaction).toHaveBeenCalledTimes(1);
    const [calledClient, calledReaction, recipients] =
      mockHandleNewReaction.mock.calls[0];
    expect(calledClient).toBe(client);
    expect(calledReaction).toEqual(reaction);
    expect(recipients.has(client)).toBe(true);
  });

  it('should not throw if there are no connected users', async () => {
    const client = createClient('playerX');
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;

    await expect(
      globalChatService.handleNewGlobalReaction(client, reaction),
    ).resolves.not.toThrow();
    expect(mockHandleNewReaction).toHaveBeenCalledWith(
      client,
      reaction,
      expect.any(Set),
    );
  });
});
