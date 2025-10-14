import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ModelName } from '../common/enum/modelName.enum';
import { Voting } from './schemas/voting.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExpiredVotingCleanupService {
  constructor(
    @InjectModel(ModelName.VOTING) private readonly model: Model<Voting>,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  private async handleExpiredVotingCleanup() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await this.model.deleteMany({ endsOn: { $lt: oneWeekAgo } });
  }
}
