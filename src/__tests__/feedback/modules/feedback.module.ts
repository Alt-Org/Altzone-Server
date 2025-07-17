import mongoose from 'mongoose';
import { FeedbackService } from '../../../feedback/feedback.service';
import FeedbackCommonModule from './feedbackCommon';
import { ModelName } from '../../../common/enum/modelName.enum';
import { FeedbackSchema } from '../../../feedback/feedback.schema';

export default class FeedbackModule {
  private constructor() {}

  static getFeedbackModel() {
    return mongoose.model(ModelName.FEEDBACK, FeedbackSchema);
  }

  static async getFeedbackService() {
    const module = await FeedbackCommonModule.getModule();
    return module.resolve(FeedbackService);
  }
}
