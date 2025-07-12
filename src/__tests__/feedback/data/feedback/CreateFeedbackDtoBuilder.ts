import { ObjectId } from 'mongodb';
import { CreateFeedbackDto } from '../../../../feedback/dto/createFeedback.dto';

export default class CreateFeedbackDtoBuilder {
  private readonly base: Partial<CreateFeedbackDto> = {
    profile_id: new ObjectId().toString(),
    text: 'test',
    capturedAt: new Date(),
  };

  build(): CreateFeedbackDto {
    return { ...this.base } as CreateFeedbackDto;
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
