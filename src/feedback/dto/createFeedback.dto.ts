import AddType from '../../common/base/decorator/AddType.decorator';
import { IsDate, IsString } from 'class-validator';

@AddType('CreateFeedbackDto')
export class CreateFeedbackDto {
  /**
   * Profile Id
   */
  @IsString()
  profile_id: string;
  /**
   * Feedbacks text message
   */
  @IsString()
  text: string;

  /**
   * Feedbacks captured date
   */
  @IsDate()
  capturedAt?: Date;
}
