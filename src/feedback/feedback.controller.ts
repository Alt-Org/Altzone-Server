import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ModelName } from '../common/enum/modelName.enum';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';
import { FeedbackDto } from './dto/feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Test/Admin users send feedbacks to the developers
   *
   * @remarks Available only in testing session environment.
   *
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      modelName: ModelName.FEEDBACK,
      dto: FeedbackDto,
    },
    errors: [],
  })
  @Post('add')
  @SwaggerTags('Release on 27.07.2025', 'Feedback')
  @UniformResponse(ModelName.FEEDBACK)
  async create(
    @Body() feedbackDto: CreateFeedbackDto,
    @LoggedUser() user: User,
  ) {
    return this.feedbackService.createOne(feedbackDto, user);
  }
}
