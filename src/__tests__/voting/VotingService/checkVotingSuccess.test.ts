import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VoteChoice } from '../../../voting/enum/choiceType.enum';

describe('VotingService.checkVotingSuccess() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const voteBuilder = VotingBuilderFactory.getBuilder('Vote');

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  it('Should return true if Yes Percentage of votes >= minPercentage of voting', async () => {
    const vote = voteBuilder.setChoice(VoteChoice.YES).build();
    const minPercentage = 1;
    const votingDto = votingBuilder
      .setMinPercentage(minPercentage)
      .setVotes([vote])
      .build();

    const isSuccess = await votingService.checkVotingSuccess(votingDto);

    expect(isSuccess).toBe(true);
  });

  it('Should return false if Yes Percentage of votes < minPercentage of voting', async () => {
    const vote = voteBuilder.setChoice(VoteChoice.NO).build();
    const minPercentage = 100;
    const votingDto = votingBuilder
      .setMinPercentage(minPercentage)
      .setVotes([vote])
      .build();

    const isSucess = await votingService.checkVotingSuccess(votingDto);

    expect(isSucess).toBe(false);
  });
});
