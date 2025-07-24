import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { env } from 'process';
import { SEReason } from '../../../common/service/basicService/SEReason';
import createMockSession from '../../common/MongooseSession/CreateMockSession';
import { ChatMessage } from '../../../chat/schema/chatMessage.schema';
import { Model } from 'mongoose';

describe('ChatService.deleteChatMessageById() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');

  const clan1ID = new ObjectId().toString();
  const player1ID = new ObjectId();
  let clanChatToCreate1: ChatMessage;

  const globalMessages = [];
  const clanMessages = [];
  let model: Model<ChatMessage>;
  let sessionMock: any;

  beforeAll(() => {
    env.ENVIRONMENT = 'TESTING_SESSION';

    const globalChatToCreate = chatMessageBuilder
      .setType(ChatType.GLOBAL)
      .setSenderId(new ObjectId())
      .build();

    globalMessages.push(globalChatToCreate);

    clanChatToCreate1 = chatMessageBuilder
      .setType(ChatType.CLAN)
      .setSenderId(player1ID)
      .setClanId(clan1ID)
      .build();

    clanMessages.push(clanChatToCreate1);
  });

  beforeEach(async () => {
    await chatModel.deleteMany({});
    jest.clearAllMocks();

    chatService = await ChatModule.getChatService();

    model = chatService.model;
    sessionMock = createMockSession(model);
    await chatModel.create([...clanMessages]);
  });

  it('Should delete a chat by Id', async () => {
    const chatResp = await chatModel.create(clanMessages);
    //const chat = await chatModel.find({ clan_id: clan1ID });
    const existingChat = chatResp[0];
    const chatId = existingChat.id.toString();
    // const chat = await chatModel.find({ clan_id: clan1ID });
    //const chatId = chat[0].id.toString();

    const deletedChat1 = await chatModel.findById(chatId);

    const [message, err] = await chatService.deleteChatMessageById(chatId);

    const deletedChat = await chatModel.findById(chatId);

    expect(err).toBeNull();
    expect(message).toBeUndefined();
    expect(deletedChat1).toBeDefined();
    expect(deletedChat).toBeNull();
    expect(sessionMock.startTransaction).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(sessionMock.endSession).toHaveBeenCalled();
    expect(sessionMock.startTransaction).toHaveBeenCalledTimes(1);
    expect(sessionMock.commitTransaction).toHaveBeenCalledTimes(1);
    expect(sessionMock.endSession).toHaveBeenCalledTimes(1);
  });

  it('Should return with error if the ENVIRONMENT is NOT TESTING_SESSION', async () => {
    env.ENVIRONMENT = 'PRODUCTION';
    const [message, err] = await chatService.deleteChatMessageById(null);

    expect(err).toBeDefined();
    expect(err[0].reason).toBe(SEReason.MISCONFIGURED);
    expect(err[0].message).toBe(
      'This endpoint is only available in TESTING_SESSION.',
    );
    expect(message).toBeFalsy();
  });
});
