import { CreateFeedbackDto } from '../../../../feedback/dto/createFeedback.dto';

export default class CreateFeedbackDtoBuilder {
  private readonly base: Partial<CreateFeedbackDto> = {
    text: 'test',
  };

  build(): CreateFeedbackDto {
    return { ...this.base } as CreateFeedbackDto;
  }

  setText(text: string) {
    this.base.text = text;
    return this;
  }
}
