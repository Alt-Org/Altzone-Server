import { IsString } from 'class-validator';

export class CreateFeedbackDto {
  /**
   * Feedbacks text message
   *
   * @example "This is a feedback message."
   */
  @IsString()
  text: string;
}
