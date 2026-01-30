import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import ChatModule from '../modules/chat.module';

describe('ChatService.addReaction() test suite', () => {
  let chatService: ChatService;
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
  const chatModel = ChatModule.getChatModel();
  const mockSenderId = '60f7c2d9a2d3c7b7e56d01df';

  const senderId = new ObjectId();
  const reactPlayerName = 'ReactMan420';
  const chatToCreate = chatMessageBuilder
    .setSenderId(senderId)
    .setReactions([{ playerName: reactPlayerName, emoji: '👍' }])
    .build();

  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
    await chatModel.deleteMany({});
  });

  it('Should add a reaction to a chat message', async () => {
    const chat = await chatModel.create(chatToCreate);

    const [updated, err] = await chatService.addReaction(
      chat._id.toString(),
      reactPlayerName,
      '👍',
      mockSenderId,
    );

    expect(err).toBeNull();
    expect(updated.reactions).toEqual([
      { playerName: reactPlayerName, emoji: '👍', sender_id: mockSenderId },
    ]);
  });

  it('Should replace previous reaction from the same player', async () => {
    const chat = await chatModel.create(chatToCreate);

    const [updated, err] = await chatService.addReaction(
      chat._id.toString(),
      reactPlayerName,
      '😂',
      mockSenderId,
    );

    expect(err).toBeNull();
    expect(updated.reactions).toEqual([
      { playerName: reactPlayerName, emoji: '😂', sender_id: mockSenderId },
    ]);
  });

  it('Should remove reaction if emoji is empty', async () => {
    const chat = await chatModel.create(chatToCreate);

    const [updated, err] = await chatService.addReaction(
      chat._id.toString(),
      reactPlayerName,
      '',
      mockSenderId,
    );

    expect(err).toBeNull();
    expect(updated.reactions).toEqual([]);
  });

  it('Should return error if message does not exist', async () => {
    const fakeId = new ObjectId().toString();
    const [updated, err] = await chatService.addReaction(
      fakeId,
      'NoPlayer',
      '🔥',
      mockSenderId,
    );

    expect(updated).toBeNull();
    expect(err).not.toBeNull();
  });
});
