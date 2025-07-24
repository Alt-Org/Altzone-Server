import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { env } from 'process';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ChatMessage } from '../../../chat/schema/chatMessage.schema';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';

describe('ChatService.deleteChatMessageById() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');

  const clan1ID = new ObjectId().toString();
  const player1ID = new ObjectId();
  let clanChatToCreate1: ChatMessage;

  const clanMessages = [];

  beforeAll(() => {
    clanChatToCreate1 = chatMessageBuilder
      .setType(ChatType.CLAN)
      .setSenderId(player1ID)
      .setClanId(clan1ID)
      .build();

    clanMessages.push(clanChatToCreate1);
  });

  beforeEach(async () => {
    env.ENVIRONMENT = Environment.TESTING_SESSION;
    await chatModel.deleteMany({});
    jest.clearAllMocks();

    chatService = await ChatModule.getChatService();
  });

  it('Should delete a chat by Id', async () => {
    const chatResp = await chatModel.create(clanMessages);
    const existingChat = chatResp[0];
    const chatId = existingChat.id.toString();

    const [message, err] = await chatService.deleteChatMessageById(chatId);

    const deletedChat = await chatModel.findById(chatId);

    expect(message).toBeTruthy();
    expect(err).toBeNull();
    expect(deletedChat).toBeNull();
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

  it('Should return ServiceError NOT_FOUND if the object with provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const [wasDeleted, errors] =
      await chatService.deleteChatMessageById(nonExisting_id);

    expect(wasDeleted).toBeFalsy();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
