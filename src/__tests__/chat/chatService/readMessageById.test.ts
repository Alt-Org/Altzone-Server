import { mongo } from 'mongoose';
import { ChatService } from '../../../chat/chat.service';
import ChatModule from '../modules/chat.module';
import CreateChatDtoBuilder from '../data/chat/createChatDtoBuilder';
import CreateMessageDtoBuilder from '../data/chat/createMessageDtoBuilder';
import { IResponseShape } from '../../../common/interface/IResponseShape';
import { Chat } from '../../../chat/chat.schema';

describe('ChatService.readOneMessageById() test suite', () => {
  let chatService: ChatService;
  let chatId: string;
  const messageBuilder = new CreateMessageDtoBuilder();
  const chatBuilder = new CreateChatDtoBuilder();
  const testChatName = 'testChat';
  const chatToCreate = chatBuilder.setName(testChatName).build();

  /**
   * Before all tests, create a chat to be used for message tests.
   * This ensures that there is a chat available in the database
   * for the messages to be created in.
   */
  beforeAll(async () => {
    const chatModel = await ChatModule.getChatModel();
    const chat = await chatModel.create(chatToCreate);
    chatId = chat.id;
  });

  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
  });

  it('Should return a message by ID if it exists', async () => {
    const messageToCreate = messageBuilder
      .setSenderUsername('testUser')
      .build();

    await chatService.createMessage(chatId, messageToCreate);

    const message = (await chatService.readOneMessageById(
      chatId,
      messageToCreate.id,
    )) as IResponseShape<Chat, object>;
    expect(message.data.Chat).toEqual(expect.objectContaining(messageToCreate));
  });

  it('Should return null if the message does not exist', async () => {
    const nonExistentMessageId = 999;
    const message = await chatService.readOneMessageById(
      chatId,
      nonExistentMessageId,
    );
    expect(message).toBeNull();
  });

  it('Should return null if the chat does not exist', async () => {
    const nonExistentChatId = new mongo.ObjectId().toString();
    const messageId = 1;
    const message = await chatService.readOneMessageById(
      nonExistentChatId,
      messageId,
    );
    expect(message).toBeNull();
  });
});
