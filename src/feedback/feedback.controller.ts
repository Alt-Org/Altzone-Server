import { Body, Controller, Post } from '@nestjs/common';
import { _idDto } from '../common/dto/_id.dto';
import { FeedbackService } from './feedback.service';
import { FeedbackDto } from './dto/Feedback.dto';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
     * Test/Admin users send feedbacks to the developers
     *
     * @remarks Available only on the test enviremontes.
     *
     */
    @ApiResponseDescription({
      success: {
        status: 201,
      },
      errors: [],
    })
  @Post('add')
  @UniformResponse()
  async create(@Body() feedbackDto: FeedbackDto, @LoggedUser() user: User) {
    
    return this.feedbackService.createOne(feedbackDto, user);
  }
}
