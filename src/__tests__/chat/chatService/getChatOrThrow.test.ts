import { ChatService } from '../../../chat/chat.service';
import ChatModule from '../modules/chat.module';
import CreateChatDtoBuilder from '../data/chat/createChatDtoBuilder';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

describe('ChatService.getChatOrThrowNotFoundError() test suite', () => {
  let chatService: ChatService;
  let chatId: string;
  const chatModel = ChatModule.getChatModel();
  const chatBuilder = new CreateChatDtoBuilder();
  const testChatName = 'testChat';
  const chatToCreate = chatBuilder.setName(testChatName).build();

  /**
   * Before each test, create a chat to be used for message tests.
   * This ensures that there is a chat available in the database
   * for the messages to be created in.
   */
  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
    const chat = await chatModel.create(chatToCreate);
    chatId = chat._id.toString();
  });

  it('Should return the chat if it exists', async () => {
    const chat = await chatService['getChatOrThrowNotFoundError'](chatId);
    expect(chat).toBeDefined();
    expect(chat._id.toString()).toBe(chatId);
  });

  it('Should throw NotFoundException if the chat does not exist', async () => {
    const nonExistentChatId = new ObjectId().toString();
    await expect(
      chatService['getChatOrThrowNotFoundError'](nonExistentChatId),
    ).rejects.toThrow(NotFoundException);
  });
});
