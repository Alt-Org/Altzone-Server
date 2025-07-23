import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { env } from 'process';
import { SEReason } from '../../../common/service/basicService/SEReason';

describe('ChatService.deleteChatMessage() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');

  const clan1ID = new ObjectId().toString();
  const player1ID = new ObjectId();

  const globalMessages = [];
  const clanMessages = [];

  beforeAll(() => {
    env.ENVIRONMENT = 'TESTING_SESSION';
    const globalChatToCreate = chatMessageBuilder
      .setType(ChatType.GLOBAL)
      .setSenderId(new ObjectId())
      .build();

    globalMessages.push(globalChatToCreate);

    const clanChatToCreate1 = chatMessageBuilder
      .setType(ChatType.GLOBAL)
      .setSenderId(player1ID)
      .setClanId(clan1ID)
      .build();

    clanMessages.push(clanChatToCreate1);
  });

  beforeEach(async () => {
    await chatModel.deleteMany({});
    chatService = await ChatModule.getChatService();

    await chatModel.create([...globalMessages, ...clanMessages]);
  });

  it('Should return with error if the ENVIRONMENT is NOT TESTING_SESSION', async () => {
    env.ENVIRONMENT = 'PRODUCTION';
    const [message, err] = await chatService.deleteChatMessage(null);

    expect(err).toBeDefined();
    expect(err[0].reason).toBe(SEReason.MISCONFIGURED);
    expect(err[0].message).toBe(
      'This endpoint is only available in TESTING_SESSION.',
    );
    expect(message).toBeFalsy();
  });
});
