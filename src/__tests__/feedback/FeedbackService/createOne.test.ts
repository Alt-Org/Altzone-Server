import { FeedbackService } from '../../../feedback/feedback.service';
import FeedbackModule from '../modules/feedback.module';
import FeedbackBuilderFactory from '../data/feedbackBuilderFactory';
import AuthBuilderFactory from '../../auth/data/authBuilderFactory';
import { ObjectId } from 'mongodb';

describe('FeedbackService.createOne() test suite', () => {
  let feedbackService: FeedbackService;
  const feedbackModel = FeedbackModule.getFeedbackModel();

  const userBuilder = AuthBuilderFactory.getBuilder('User');

  const profile_id = new ObjectId().toString();
  const user = userBuilder.setProfileId(profile_id).build();

  const createFeedbackBuilder =
    FeedbackBuilderFactory.getBuilder('CreateFeedback');
  const createFeedbackDto = createFeedbackBuilder
    .setProfileId(profile_id)
    .build();

  beforeEach(async () => {
    feedbackService = await FeedbackModule.getFeedbackService();
  });

  it('Should save feedback data to DB if input is valid', async () => {
    await feedbackService.createOne(createFeedbackDto, user);

    const dbResp = await feedbackModel.find({ profile_id: profile_id });
    const feedbackInDB = dbResp[0]?.toObject();

    expect(dbResp).toHaveLength(1);
    expect(feedbackInDB.text).toBe(createFeedbackDto.text);
    expect(feedbackInDB.profile_id).toBe(createFeedbackDto.profile_id);
  });
});
