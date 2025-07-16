import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { Model } from 'mongoose';
import { Feedback } from './feedback.schema';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { FeedbackDto } from './dto/Feedback.dto';
import { User } from '../auth/user';

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
   * Creates an new Feedback in DB.
   *
   * @param feedbackDto - The Feedback data to create.
   * @param user - The user making the request.
   * @returns  created Feedback or an array of service errors if any occurred.
   */
  async createOne(feedbackDto: FeedbackDto, user: User) {
    const createFeedback: CreateFeedbackDto = {
      text: feedbackDto.text,
      profile_id: user.profile_id,
      capturedAt: new Date(),
    };
    return this.basicService.createOne<CreateFeedbackDto>(createFeedback);
  }
}
