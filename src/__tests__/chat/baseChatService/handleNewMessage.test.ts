import { BaseChatService } from '../../../chat/service/baseChat.service';
import { ChatService } from '../../../chat/service/chat.service';
import { CreateChatMessageDto } from '../../../chat/dto/createMessage.dto';
import { WebSocketUser } from '../../../chat/types/WsUser.type';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import { MessageEventType } from '../../../chat/enum/messageEventType.enum';
import ChatModule from '../modules/chat.module';
import { ObjectId } from 'mongodb';

class TestBaseChatService extends BaseChatService {
  public broadcast = jest.fn();
}

describe('BaseChatService.handleNewMessage', () => {
  let chatService: ChatService;
  let baseChatService: TestBaseChatService;
  let client: WebSocketUser;

  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
    baseChatService = new TestBaseChatService(chatService);
    baseChatService['chatService'].createChatMessage = jest.fn();
    client = {
      send: jest.fn(),
      readyState: 1,
      user: { playerId: 'p1', clanId: 'c1' },
    } as any;
    jest.clearAllMocks();
  });

  it('should send validation error if validation fails', async () => {
    const chatMessage = new CreateChatMessageDto({});
    await baseChatService.handleNewMessage(
      chatMessage,
      client,
      ChatType.CLAN,
      new Set([client]),
    );
    expect(client.send).toHaveBeenCalledWith(
      expect.stringContaining('Validation failed'),
    );
    expect(chatService.createChatMessage).not.toHaveBeenCalled();
    expect(baseChatService.broadcast).not.toHaveBeenCalled();
  });

  it('should send error if createChatMessage returns error', async () => {
    (chatService.createChatMessage as jest.Mock).mockResolvedValue([
      null,
      'error',
    ]);
    const chatMessage = new CreateChatMessageDto({});
    await baseChatService.handleNewMessage(
      chatMessage,
      client,
      ChatType.CLAN,
      new Set([client]),
    );
    expect(client.send).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(baseChatService.broadcast).not.toHaveBeenCalled();
  });

  it('should broadcast message if validation and creation succeed', async () => {
    const message = new CreateChatMessageDto({
      type: ChatType.GLOBAL,
      sender_id: new ObjectId().toString(),
      content: 'Hello there!',
    });
    (chatService.createChatMessage as jest.Mock).mockResolvedValue([
      message,
      null,
    ]);

    const recipients = new Set([client]);
    await baseChatService.handleNewMessage(
      message,
      client,
      ChatType.GLOBAL,
      recipients,
    );

    expect(chatService.createChatMessage).toHaveBeenCalled();
    expect(baseChatService.broadcast).toHaveBeenCalledWith(
      {
        chat: ChatType.GLOBAL,
        event: MessageEventType.NEW_MESSAGE,
        message: message,
      },
      recipients,
    );
    expect(client.send).not.toHaveBeenCalledWith(
      expect.stringContaining('error'),
    );
  });
});
