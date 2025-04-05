import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import VotingCommonModule from './votingCommon.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingSchema } from '../../../voting/schemas/voting.schema';

export default class VotingModule {
  private constructor() {}

  static async getVotingService() {
    const module = await VotingCommonModule.getModule();
    return await module.resolve(VotingService);
  }

  static getVotingModel() {
    return mongoose.model(ModelName.VOTING, VotingSchema);
  }
}
