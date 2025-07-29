import CreateFeedbackBuilder from './feedback/CreateFeedbackBuilder';
import CreateFeedbackDtoBuilder from './feedback/CreateFeedbackDtoBuilder';
import { FeedbackBuilder } from './feedback/FeedbackBuilder';

type BuilderName = 'CreateFeedback' | 'CreateFeedbackDto' | 'Feedback';

type BuilderMap = {
  CreateFeedback: CreateFeedbackBuilder;
  CreateFeedbackDto: CreateFeedbackDtoBuilder;
  Feedback: FeedbackBuilder;
};

export default class FeedbackBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreateFeedback':
        return new CreateFeedbackBuilder() as BuilderMap[T];
      case 'CreateFeedbackDto':
        return new CreateFeedbackDtoBuilder() as BuilderMap[T];
      case 'Feedback':
        return new FeedbackBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
