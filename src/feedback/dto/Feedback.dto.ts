import { IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('FeedbackDto')
export class FeedbackDto {
  /**
   * Feedbacks text message
   * 
   * * @example "This is a feedback message."
   */
  @IsString()
  text: string;
}
