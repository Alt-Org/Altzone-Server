import { Feedback } from '../../../../feedback/feedback.schema';
import { ObjectId } from 'mongodb';

export class FeedbackBuilder {
  private readonly base: Feedback = {
    profile_id: new ObjectId().toString(),
    text: 'Sample feedback text',
    capturedAt: new Date(),
    _id: undefined,
  };

  build(): Feedback {
    return { ...this.base } as Feedback;
  }

  setProfileId(profileId: string): this {
    this.base.profile_id = profileId;
    return this;
  }

  setText(text: string): this {
    this.base.text = text;
    return this;
  }

  setCapturedAt(date: Date): this {
    this.base.capturedAt = date;
    return this;
  }

  setId(id: string): this {
    this.base._id = id;
    return this;
  }
}
