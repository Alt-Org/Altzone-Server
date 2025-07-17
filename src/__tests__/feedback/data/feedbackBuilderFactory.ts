import CreateFeedbackBuilder from './feedback/CreateFeedbackBuilder';
import CreateFeedbackDtoBuilder from './feedback/CreateFeedbackDtoBuilder';

type BuilderName = 'CreateFeedback' | 'CreateFeedbackDto';

type BuilderMap = {
  CreateFeedback: CreateFeedbackBuilder;
  CreateFeedbackDto: CreateFeedbackDtoBuilder;
};

export default class FeedbackBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreateFeedback':
        return new CreateFeedbackBuilder() as BuilderMap[T];
      case 'CreateFeedbackDto':
        return new CreateFeedbackDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
