import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { ItemVoteChoice } from '../../../voting/enum/choiceType.enum';

describe('VotingService.checkVotingSuccess() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const voteBuilder = VotingBuilderFactory.getBuilder('Vote');

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  it('Should return with True if Yes Percentage of votes >= minPercentage of voting', async () => {
    const vote = voteBuilder.setChoice(ItemVoteChoice.YES).build();
    const minPercentage = 1;
    const votingDto = votingBuilder
      .setMinPercentage(minPercentage)
      .setVotes([vote])
      .build();

    const isSucess = await votingService.checkVotingSuccess(votingDto);

    expect(isSucess).toBe(true);
  });

  it('Should return with False if Yes Percentage of votes < minPercentage of voting', async () => {
    const vote = voteBuilder.setChoice(ItemVoteChoice.NO).build();
    const minPercentage = 100;
    const votingDto = votingBuilder
      .setMinPercentage(minPercentage)
      .setVotes([vote])
      .build();

    const isSucess = await votingService.checkVotingSuccess(votingDto);

    expect(isSucess).toBe(false);
  });
});
