import { ObjectId } from 'mongodb';
import { ChatService } from '../../../chat/service/chat.service';
import ChatBuilderFactory from '../data/chatBuilderFactory';
import ReactionDtoBuilder from '../data/builder/ReactionDtoBuilder';
import ChatModule from '../modules/chat.module';

describe('ChatService.addReaction() test suite', () => {
  let chatService: ChatService;
  const chatMessageBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
  const chatModel = ChatModule.getChatModel();
  const mockSenderId = '60f7c2d9a2d3c7b7e56d01df';
  const reactPlayerName = 'ReactMan420';

  const getInitialChat = () => chatMessageBuilder
    .setSenderId(new ObjectId())
    .setReactions([]) 
    .build();

  beforeEach(async () => {
    chatService = await ChatModule.getChatService();
    await chatModel.deleteMany({});
  });

  it('Should add a reaction to a chat message', async () => {
    const chat = await chatModel.create(getInitialChat());

    const reaction = new ReactionDtoBuilder()
      .setPlayerName(reactPlayerName)
      .setEmoji('👍')
      .setSenderId(mockSenderId)
      .build();

    const [updated, err] = await chatService.addReaction(
      chat._id.toString(),
      reaction.playerName,
      reaction.emoji,
      reaction.sender_id,
    );

    expect(err).toBeNull();
    expect(updated.reactions).toEqual([
      { playerName: reactPlayerName, emoji: '👍', sender_id: mockSenderId },
    ]);
  });

  it('Should replace previous reaction from the same player', async () => {
    const initialChat = chatMessageBuilder
      .setReactions([{ playerName: reactPlayerName, emoji: '👍', sender_id: mockSenderId }])
      .build();
    const chat = await chatModel.create(initialChat);

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
    const initialChat = chatMessageBuilder
      .setReactions([{ playerName: reactPlayerName, emoji: '👍', sender_id: mockSenderId }])
      .build();
    const chat = await chatModel.create(initialChat);

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