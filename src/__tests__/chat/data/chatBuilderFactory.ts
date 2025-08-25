import AddReactionDtoBuilder from './builder/AddReactionDtoBuilder';
import ChatMessageBuilder from './builder/chatMessageBuilder';
import ReactionDtoBuilder from './builder/ReactionDtoBuilder';
import UpdateChatMessageDtoBuilder from './builder/UpdateChatMessageDtoBuilder';

type BuilderName =
  | 'AddReactionDto'
  | 'ReactionDto'
  | 'ChatMessage'
  | 'UpdateChatMessageDto';

type BuilderMap = {
  AddReactionDto: AddReactionDtoBuilder;
  ReactionDto: ReactionDtoBuilder;
  ChatMessage: ChatMessageBuilder;
  UpdateChatMessageDto: UpdateChatMessageDtoBuilder;
};

export default class ChatBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'AddReactionDto':
        return new AddReactionDtoBuilder() as BuilderMap[T];

      case 'ReactionDto':
        return new ReactionDtoBuilder() as BuilderMap[T];

      case 'ChatMessage':
        return new ChatMessageBuilder() as BuilderMap[T];
      case 'UpdateChatMessageDto':
        return new UpdateChatMessageDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
