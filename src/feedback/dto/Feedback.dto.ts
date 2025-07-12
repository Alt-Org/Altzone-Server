import { IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('FeedbackDto')
export class FeedbackDto {
  /**
   * Feedbacks text message
   */
  @IsString()
  text: string;
}
