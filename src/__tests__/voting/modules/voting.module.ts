import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import VotingCommonModule from './votingCommon.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingSchema } from '../../../voting/schemas/voting.schema';
import VotingNotifier from '../../../voting/voting.notifier';
import { VotingQueue } from './../../../voting/voting.queue';
import { ExpiredVotingCleanupService } from '../../../voting/expired-voting-cleanup.service';

export default class VotingModule {
  private constructor() {}

  static async getVotingService() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingService);
  }

  static async getVotingNotifier() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingNotifier);
  }

  static async getVotingQueue() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingQueue);
  }

  static getVotingModel() {
    return mongoose.model(ModelName.VOTING, VotingSchema);
  }

  static async getExpiredVotingCleanupService() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(ExpiredVotingCleanupService);
  }
}
