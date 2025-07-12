import { FeedbackDto } from '../../../../feedback/dto/Feedback.dto';

export default class FeedbackDtoBuilder {
  private readonly base: Partial<FeedbackDto> = {
    text: 'test',
  };

  build(): FeedbackDto {
    return { ...this.base } as FeedbackDto;
  }

  setText(text: string) {
    this.base.text = text;
    return this;
  }
}
