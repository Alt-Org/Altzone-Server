import AddType from '../../common/base/decorator/AddType.decorator';
import { IsDate, IsString } from 'class-validator';

@AddType('CreateFeedbackDto')
export class CreateFeedbackDto {
  /**
   * Profile Id
   *
   * @example "665af23e5e982f0013aa8899"
   */
  @IsString()
  profile_id: string;
  /**
   * Feedbacks text message
   *
   * @example "This is a feedback message."
   */
  @IsString()
  text: string;

  /**
   * Feedbacks captured date
   *
   * @example "2023-10-01T12:00:00Z"
   */
  @IsDate()
  capturedAt?: Date;
}
