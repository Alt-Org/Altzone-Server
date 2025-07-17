import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { Model } from 'mongoose';
import { Feedback } from './feedback.schema';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { User } from '../auth/user';
import { IServiceReturn } from '../common/service/basicService/IService';
import { CreateFeedback } from './payloads/createFeedback';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    public readonly model: Model<Feedback>,
  ) {
    this.basicService = new BasicService(model);
  }

  private readonly basicService: BasicService;

  /**
   * Creates a new Feedback in DB.
   *
   * @param feedbackDto - The Feedback data to create.
   * @param user - The user making the request.
   * @returns  created Feedback or an array of service errors if any occurred.
   */
  async createOne(
    feedbackDto: CreateFeedbackDto,
    user: User,
  ): Promise<IServiceReturn<CreateFeedback>> {
    const createFeedback: CreateFeedback = {
      text: feedbackDto.text,
      profile_id: user.profile_id,
      capturedAt: new Date(),
    };
    return this.basicService.createOne<CreateFeedback>(createFeedback);
  }
}
