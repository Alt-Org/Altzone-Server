import { ObjectId } from 'mongodb';
import { CreateFeedback } from '../../../../feedback/payloads/createFeedback';

export default class CreateFeedbackBuilder {
  private readonly base: CreateFeedback = {
    profile_id: new ObjectId().toString(),
    text: 'test',
    capturedAt: new Date(),
  };

  build(): CreateFeedback {
    return { ...this.base } as CreateFeedback;
  }

  setProfileId(profile_id: string) {
    this.base.profile_id = profile_id;
    return this;
  }

  setText(text: string) {
    this.base.text = text;
    return this;
  }

  setCapturedAt(capturedAt: Date) {
    this.base.capturedAt = capturedAt;
    return this;
  }
}
