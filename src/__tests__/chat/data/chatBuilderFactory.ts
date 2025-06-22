import AddReactionDtoBuilder from './builder/AddReactionDtoBuilder';
import ChatMessageBuilder from './builder/chatMessageBuilder';
import ReactionDtoBuilder from './builder/reactionDtoBuilder';

type BuilderName = 'AddReactionDto' | 'ReactionDto' | 'ChatMessage';

type BuilderMap = {
  AddReactionDto: AddReactionDtoBuilder;
  ReactionDto: ReactionDtoBuilder;
  ChatMessage: ChatMessageBuilder;
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
    }
  }
}
