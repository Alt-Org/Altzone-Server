import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import IGetAllQueryBuilder from '../../common/interface/data/interface/IGetAllQueryBuilder';

describe('ChatService.getMessages() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
  const queryBuilder = new IGetAllQueryBuilder();

  const clan1ID = new ObjectId().toString();
  const clan2ID = new ObjectId().toString();
  const player1ID = new ObjectId();
  const player2ID = new ObjectId();
  const player3ID = new ObjectId();

  const globalMessages = [];
  const clanMessages = [];

  beforeAll(() => {
    for (let i = 0; i < 5; i++) {
      const globalChatToCreate = chatMessageBuilder
        .setType(ChatType.GLOBAL)
        .setSenderId(new ObjectId())
        .build();

      globalMessages.push(globalChatToCreate);

      const clanChatToCreate1 = chatMessageBuilder
        .setType(ChatType.CLAN)
        .setSenderId(i % 2 === 0 ? player1ID : player2ID)
        .setClanId(clan1ID)
        .build();

      clanMessages.push(clanChatToCreate1);

      const clanChatToCreate2 = chatMessageBuilder
        .setType(ChatType.CLAN)
        .setSenderId(player3ID)
        .setClanId(clan2ID)
        .build();

      clanMessages.push(clanChatToCreate2);
    }
  });

  beforeEach(async () => {
    await chatModel.deleteMany({});
    chatService = await ChatModule.getChatService();

    await chatModel.create([...globalMessages, ...clanMessages]);
  });

  it('Should get all global messages', async () => {
    const query = queryBuilder.setFilter({ type: ChatType.GLOBAL }).build();
    const [messages, err] = await chatService.getMessages(query);

    expect(err).toBeNull();
    globalMessages.forEach((msg) => {
      expect(messages).toContainEqual(expect.objectContaining({ ...msg }));
    });
  });

  it('Should get all clan1 messages', async () => {
    const query = queryBuilder
      .setFilter({
        type: ChatType.CLAN,
        clan_id: clan1ID,
      })
      .build();

    const [messages, err] = await chatService.getMessages(query);

    expect(err).toBeNull();
    expect(messages).toHaveLength(5);
    expect(messages.every((msg) => msg.clan_id === clan1ID)).toBe(true);
  });

  it('Should return an empty array if no messages match the filter', async () => {
    const query = queryBuilder
      .setFilter({
        type: ChatType.CLAN,
        clan_id: new ObjectId().toString(),
      })
      .build();

    const [messages, err] = await chatService.getMessages(query);

    expect(err).toContainSE_NOT_FOUND();
    expect(messages).toBeNull();
  });

  it('Should apply skip (offset) correctly', async () => {
    const query = queryBuilder
      .setFilter({
        type: ChatType.CLAN,
        clan_id: clan1ID,
      })
      .setSkip(2)
      .build();

    const [messages, err] = await chatService.getMessages(query);

    expect(err).toBeNull();
    expect(messages.length).toBeLessThanOrEqual(3);
  });

  it('Should return messages sorted by createdAt descending', async () => {
    const query = queryBuilder
      .setFilter({ type: ChatType.GLOBAL })
      .setSort({ createdAt: -1 })
      .build();

    const [messages, err] = await chatService.getMessages(query);

    expect(err).toBeNull();
    for (let i = 1; i < messages.length; i++) {
      expect(
        new Date(messages[i - 1].createdAt).getTime(),
      ).toBeGreaterThanOrEqual(new Date(messages[i].createdAt).getTime());
    }
  });

  it('Should populate sender field for each message', async () => {
    const query = queryBuilder.setFilter({ type: ChatType.GLOBAL }).build();

    const [messages, err] = await chatService.getMessages(query);

    expect(err).toBeNull();
    messages.forEach((msg) => {
      expect(msg.sender).toBeDefined();
    });
  });
});
