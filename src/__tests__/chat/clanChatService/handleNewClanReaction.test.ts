import { ClanChatService } from '../../../chat/service/clanChat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import ChatModule from '../modules/chat.module';
import { AddReactionDto } from '../../../chat/dto/addReaction.dto';

describe('ClanChatService.handleNewClanReaction() test suite', () => {
  let clanChatService: ClanChatService;
  let mockHandleNewReaction: jest.SpyInstance;

  beforeEach(async () => {
    clanChatService = await ChatModule.getClanChatService();
    mockHandleNewReaction = jest
      .spyOn(clanChatService, 'handleNewReaction')
      .mockResolvedValue(undefined);
    clanChatService.clanRooms.clear();
  });

  function createClient(clanId: string, playerId = 'player1'): WebSocketUser {
    return {
      user: {
        clanId,
        playerId,
        name: playerId,
      },
    } as unknown as WebSocketUser;
  }

  it('should call handleNewReaction with correct parameters and broadcast to clan room', async () => {
    const client = createClient('clanA', 'player123');
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;
    clanChatService.handleJoinChat(client);

    await clanChatService.handleNewClanReaction(client, reaction);

    expect(mockHandleNewReaction).toHaveBeenCalledTimes(1);
    const [calledClient, calledReaction, recipients] =
      mockHandleNewReaction.mock.calls[0];
    expect(calledClient).toBe(client);
    expect(calledReaction).toEqual(reaction);
    expect(recipients.has(client)).toBe(true);
  });

  it('should not throw if clan room does not exist', async () => {
    const client = createClient('clanB', 'playerX');
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;

    await expect(
      clanChatService.handleNewClanReaction(client, reaction),
    ).resolves.not.toThrow();
    expect(mockHandleNewReaction).toHaveBeenCalledWith(
      client,
      reaction,
      undefined,
    );
  });
});
