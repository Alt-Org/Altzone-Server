import { ObjectId } from 'mongodb';
import { CreateVotingDto } from '../../../voting/dto/createVoting.dto';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { ExpiredVotingCleanupService } from '../../../voting/expired-voting-cleanup.service';

describe('ExpiredVotingCleanupService.handleExpiredVotingCleanup() test suite', () => {
  const votingModel = VotingModule.getVotingModel();
  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  let expiredVotingCleanupService: ExpiredVotingCleanupService;

  beforeEach(async () => {
    expiredVotingCleanupService =
      await VotingModule.getExpiredVotingCleanupService();
  });

  const createTestVotings = async () => {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getMonth() - 1);

    const votings: CreateVotingDto[] = [];

    for (let i = 0; i < 10; i++) {
      const votingToCreate = votingBuilder
        .setMinPercentage(1)
        .setEndsOn(now)
        .setType(VotingType.FLEA_MARKET_SELL_ITEM)
        .setOrganizer({
          player_id: new ObjectId().toString(),
          clan_id: new ObjectId().toString(),
        })
        .setFleamarketItemId(new ObjectId().toString())
        .build();

      votings.push(votingToCreate);
    }

    votings[5].endsOn = monthAgo;
    votings[8].endsOn = monthAgo;

    votings.forEach(async (voting) => await votingModel.create(voting));
  };
  it('Should delete over week old votings', async () => {
    await createTestVotings();
    await expiredVotingCleanupService['handleExpiredVotingCleanup()'];

    const votings = await votingModel.find();
    expect(votings).toHaveLength(8);
  });
});
