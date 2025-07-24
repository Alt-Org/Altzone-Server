import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatModule from '../modules/chat.module';
import { ChatType } from '../../../chat/enum/chatMessageType.enum';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import { UpdateChatMessageDto } from '../../../chat/dto/updateChatMessage.dto';
import { env } from 'process';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';

describe('ChatService.updateOneById() test suite', () => {
  let chatService: ChatService;
  const chatModel = ChatModule.getChatModel();
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
  const updateChatMessageDtoBuilder = ChatBuilderFactory.getBuilder(
    'UpdateChatMessageDto',
  );

  let updateChatMessageDto: UpdateChatMessageDto;

  const clan1ID = new ObjectId().toString();
  const player1ID = new ObjectId();

  const clanMessages = [];

  beforeAll(() => {
    const clanChatToCreate1 = chatMessageBuilder
      .setType(ChatType.GLOBAL)
      .setSenderId(player1ID)
      .setClanId(clan1ID)
      .build();

    clanMessages.push(clanChatToCreate1);
  });

  beforeEach(async () => {
    await chatModel.deleteMany({});
    env.ENVIRONMENT = Environment.TESTING_SESSION;
    chatService = await ChatModule.getChatService();

    await chatModel.create([...clanMessages]);
  });

  it('Should update the ChatMessage instance in DB if input is valid', async () => {
    const chat = await chatModel.find({ clan_id: clan1ID });
    updateChatMessageDto = updateChatMessageDtoBuilder
      .setId(chat[0]._id.toString())
      .build();
    const [message, err] =
      await chatService.updateOneById(updateChatMessageDto);
    const updatedChat = await chatModel.find({ clan_id: clan1ID });

    expect(err).toBeNull();
    expect(message).toBeTruthy();
    expect(updatedChat).toHaveLength(1);
    expect(updatedChat[0]._id.toString()).toBe(chat[0]._id.toString());
    expect(updatedChat[0].content).toBe(updateChatMessageDto.content);
    expect(updatedChat[0].type).toBe(updateChatMessageDto.type);
    expect(updatedChat[0].sender_id.toString()).toBe(
      updateChatMessageDto.sender_id.toString(),
    );
    expect(updatedChat[0].clan_id).toBe(clan1ID);
  });

  it('Should return with error if chat id is not defined', async () => {
    updateChatMessageDto = updateChatMessageDtoBuilder.setId(null).build();
    const [message, err] =
      await chatService.updateOneById(updateChatMessageDto);

    expect(err).toBeDefined();
    expect(err[0].reason).toBe('REQUIRED');
    expect(err[0].field).toBe('_id');
    expect(err[0].message).toBe('_id field is required');
    expect(message).toBeFalsy();
  });

  it('Should return with error if the ENVIRONMENT is NOT TESTING_SESSION', async () => {
    env.ENVIRONMENT = 'PRODUCTION';
    updateChatMessageDto = updateChatMessageDtoBuilder.build();
    const [message, err] =
      await chatService.updateOneById(updateChatMessageDto);

    expect(err).toBeDefined();
    expect(err[0].reason).toBe(SEReason.MISCONFIGURED);
    expect(err[0].message).toBe(
      'This endpoint is only available in TESTING_SESSION.',
    );
    expect(message).toBeFalsy();
  });
});
