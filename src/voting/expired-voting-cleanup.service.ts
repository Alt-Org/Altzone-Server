import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ModelName } from '../common/enum/modelName.enum';
import { Voting } from './schemas/voting.schema';
import { Model } from 'mongoose';
import { envVars } from '../common/service/envHandler/envVars';

@Injectable()
export class ExpiredVotingCleanupService {
  constructor(
    @InjectModel(ModelName.VOTING) private readonly model: Model<Voting>,
  ) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  private async handleExpiredVotingCleanup() {
    const days = parseInt(envVars.VOTING_EXPIRATION_DAYS);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    await this.model.deleteMany({ endsOn: { $lt: cutoff } });
  }
}
