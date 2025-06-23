import { BaseChatService } from '../../../chat/service/baseChat.service';
import { ChatService } from '../../../chat/service/chat.service';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import { AddReactionDto } from '../../../chat/dto/addReaction.dto';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import { MessageEventType } from '../../../chat/enum/messageEventType.enum';

class TestBaseChatService extends BaseChatService {
  public broadcast = jest.fn();
}

describe('BaseChatService.handleNewReaction() test suite', () => {
  let chatService: ChatService;
  let baseChatService: TestBaseChatService;
  let client: WebSocketUser;

  beforeEach(() => {
    chatService = {
      addReaction: jest.fn(),
    } as any;
    baseChatService = new TestBaseChatService(chatService);
    client = {
      send: jest.fn(),
      readyState: 1,
      user: { playerId: 'p1', clanId: 'c1', name: 'TestUser' },
    } as any;
    jest.clearAllMocks();
  });

  it('should send error if addReaction returns error', async () => {
    (chatService.addReaction as jest.Mock).mockResolvedValue([
      null,
      'reaction error',
    ]);
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;

    await baseChatService.handleNewReaction(
      client,
      reaction,
      new Set([client]),
    );

    expect(client.send).toHaveBeenCalledWith(
      expect.stringContaining('reaction error'),
    );
    expect(baseChatService.broadcast).not.toHaveBeenCalled();
  });

  it('should broadcast updated message if addReaction succeeds', async () => {
    const updatedMessage = {
      id: 'mid',
      reactions: [{ playerName: 'TestUser', emoji: '🔥' }],
    };
    (chatService.addReaction as jest.Mock).mockResolvedValue([
      updatedMessage,
      null,
    ]);
    const reaction: AddReactionDto = { message_id: 'mid', emoji: '🔥' } as any;
    const recipients = new Set([client]);

    await baseChatService.handleNewReaction(client, reaction, recipients);

    expect(baseChatService.broadcast).toHaveBeenCalledWith(
      {
        chat: ChatType.CLAN,
        event: MessageEventType.NEW_REACTION,
        message: updatedMessage,
      },
      recipients,
    );
    expect(client.send).not.toHaveBeenCalledWith(
      expect.stringContaining('error'),
    );
  });
});
