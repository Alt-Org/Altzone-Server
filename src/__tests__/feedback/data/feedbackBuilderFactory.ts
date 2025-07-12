import FeedbackDtoBuilder from './feedback/FeedbackDtoBuilder';
import CreateFeedbackDtoBuilder from './feedback/CreateFeedbackDtoBuilder';

type BuilderName =
  | 'FeedbackDto'
  | 'CreateFeedbackDto';

type BuilderMap = {
  FeedbackDto: FeedbackDtoBuilder;
  CreateFeedbackDto: CreateFeedbackDtoBuilder;
};

export default class FeedbackBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'FeedbackDto':
        return new FeedbackDtoBuilder() as BuilderMap[T];
      case 'CreateFeedbackDto':
        return new CreateFeedbackDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
