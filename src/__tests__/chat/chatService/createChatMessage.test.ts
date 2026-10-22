import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { ObjectId } from 'mongodb';
import { CreateChatMessageDto } from '../../../chat/dto/createMessage.dto';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import { ChatResponseType } from '../../../chat/enum/chatResponseType.enum';
import { ChatEmotion } from '../../../chat/enum/chatEmotion.enum';

describe('ChatService.createChatMessage() test suite', () => {
  let chatService: ChatService;
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
  const chatModel = ChatModule.getChatModel();

  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
    await chatModel.deleteMany({});
  });

  it('Should save chat message to DB if input is valid', async () => {
    const senderId = new ObjectId();
    const chatToCreate = new CreateChatMessageDto({
      type: ChatType.GLOBAL,
      sender_id: senderId,
      content: ChatResponseType.ONLINE,
      responseType: ChatResponseType.ONLINE,
      emotion: ChatEmotion.JOY,
    });
    await chatService.createChatMessage(chatToCreate);

    const dbResp = await chatModel.find({ content: chatToCreate.content });
    const chatInDB = dbResp[0]?.toObject();

    expect(dbResp).toHaveLength(1);
    expect(chatInDB).toEqual(expect.objectContaining({ ...chatToCreate }));
  });

  it('Should return saved chat message data if input is valid', async () => {
    const senderId = new ObjectId();
    const chatToCreate = new CreateChatMessageDto({
      type: ChatType.GLOBAL,
      sender_id: senderId,
      content: ChatResponseType.YES,
      responseType: ChatResponseType.YES,
      emotion: ChatEmotion.BLANK,
    });
    const [result, errors] = await chatService.createChatMessage(chatToCreate);

    expect(errors).toBeNull();
    expect(result).toMatchObject({ ...chatToCreate });
  });

  it('Should not save any data if the provided input is not valid', async () => {
    const invalidChat = {
      ...chatMessageBuilder.build(),
      type: 'not_enum_value',
    } as any;
    await chatService.createChatMessage(invalidChat);

    const dbResp = await chatModel.findOne({ content: invalidChat.content });
    expect(dbResp).toBeNull();
  });

  it('Should return ServiceError with reason WRONG_ENUM if the provided type is not valid', async () => {
    const invalidChat = {
      ...chatMessageBuilder.build(),
      type: 'not_enum_value',
    } as any;
    const [createdChat, errors] = (await chatService.createChatMessage(
      invalidChat,
    )) as any;

    expect(createdChat).toBeNull();
    expect(errors).toContainSE_WRONG_ENUM();
  });

  it('Should not throw any error if provided input is null or undefined', async () => {
    const nullInput = async () =>
      await chatService.createChatMessage(null as any);
    const undefinedInput = async () =>
      await chatService.createChatMessage(undefined as any);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
