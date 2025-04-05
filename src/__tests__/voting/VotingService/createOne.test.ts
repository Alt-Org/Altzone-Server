import { MongooseError } from 'mongoose';
import { MongoServerError, ObjectId } from 'mongodb';
import VotingBuilderFactory from '../data/createVotingDtoBuilder';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

describe('VotingService.createOne() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  it('Should create a voting in DB if input is valid', async () => {
    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)  
      .build();

    await votingService.createOne(votingToCreate);

    const dbData = await votingModel.findOne({ minPercentage: minPercentage });

    const {_id,...clearedResp } = clearDBRespDefaultFields(dbData);

    const {entity_id,...expectedVoting } = { ...votingToCreate };

    expect(clearedResp).toEqual(expect.objectContaining(expectedVoting));
  });

});
