import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';

describe('VotingService.createOne() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    await votingModel.deleteMany({});
  });

  it('Should create a voting in DB if input is valid', async () => {
    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .build();

    await votingService.createOne(votingToCreate);

    const dbData = await votingModel.findOne({ minPercentage: minPercentage });

    expect(dbData).not.toBeNull();
    const dbObject = dbData!.toObject();
    const clearedResp = clearDBRespDefaultFields(dbObject);

    const expectedVoting: any = {
      ...votingToCreate,
      endsOn: expect.any(Date),
      organizer: {
        clan_id: expect.anything(),
        player_id: expect.anything(),
      },
      fleaMarketItem_id: expect.anything(),
    };

    expect(clearedResp).toEqual(expect.objectContaining(expectedVoting));
  });
});
