import { Expose } from 'class-transformer';

export class FeedbackDto {
  /**
   * Profile Id
   *
   * @example "665af23e5e982f0013aa8899"
   */
  @Expose()
  profile_id: string;

  /**
   * Feedbacks text message
   *
   * @example "This is a feedback message."
   */
  @Expose()
  text: string;

  /**
   * Feedbacks captured date
   *
   * @example "2023-10-01T12:00:00Z"
   */
  @Expose()
  capturedAt?: Date;
}
