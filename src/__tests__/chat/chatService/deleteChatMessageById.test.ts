import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { env } from 'process';
import { ChatMessage } from '../../../chat/schema/chatMessage.schema';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';

describe('ChatService.deleteChatMessageById() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');

  const clanID = new ObjectId().toString();
  const playerID = new ObjectId();
  let clanChatToCreate1: ChatMessage;

  const clanMessages = [];

  beforeEach(async () => {
    env.ENVIRONMENT = Environment.TESTING_SESSION;
    await chatModel.deleteMany({});

    chatService = await ChatModule.getChatService();

    clanChatToCreate1 = chatMessageBuilder
      .setType(ChatType.CLAN)
      .setSenderId(playerID)
      .setClanId(clanID)
      .build();

    clanMessages.push(clanChatToCreate1);
  });

  it('Should delete a chat by Id', async () => {
    const chatResp = await chatModel.create(clanMessages);
    const existingChat = chatResp[0];
    const chatId = existingChat.id.toString();

    const [message, err] = await chatService.deleteChatMessageById(chatId);

    const deletedChat = await chatModel.findById(chatId);

    expect(message).toBe(true);
    expect(err).toBeNull();
    expect(deletedChat).toBeNull();
  });

  it('Should return ServiceError NOT_FOUND if the object with provided _id does not exist', async () => {
    const nonExisting_id = getNonExisting_id();
    const [wasDeleted, errors] =
      await chatService.deleteChatMessageById(nonExisting_id);

    expect(wasDeleted).toBeFalsy();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
