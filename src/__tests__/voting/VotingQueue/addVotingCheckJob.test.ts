import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingQueue } from '../../../voting/voting.queue';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';

describe('VotingQueue.addVotingCheckJob() test suite', () => {
  let votingQueue: VotingQueue;
  
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  const voting = votingBuilder.build();
  let mockedQueue: any;

  beforeEach(async () => {
    votingQueue = await VotingModule.getVotingQueue();

    mockedQueue = { 
      add: jest.fn().mockResolvedValue(undefined),
      process: jest.fn(),
    };
  });

  it('addVotingCheckJob | VotingQueueName.CLAN_ROLE', async () => {
    const votingQueueName = VotingQueueName.CLAN_ROLE;
    (votingQueue as any).clanRoleQueue = mockedQueue;

    await votingQueue.addVotingCheckJob({
          voting,
          queue: votingQueueName,
        });

    expect(votingQueue).toBeDefined();
    expect(mockedQueue.add).toHaveBeenCalledWith(
      votingQueueName,
      {
        voting,
        queue: votingQueueName,
      },
      { delay: expect.any(Number) }
    );
  });

  it('addVotingCheckJob | VotingQueueName.CLAN_SHOP', async () => {
    const votingQueueName = VotingQueueName.CLAN_SHOP;
    (votingQueue as any).clanShopQueue = mockedQueue; 
    
    await votingQueue.addVotingCheckJob({
          voting,
          queue: votingQueueName,
        });

    expect(mockedQueue.add).toHaveBeenCalledWith(
      votingQueueName,
      {
        voting,
        queue: votingQueueName,
      },
      { delay: expect.any(Number) }
    );
  });

  it('addVotingCheckJob | VotingQueueName.FLEA_MARKET', async () => {
    const votingQueueName = VotingQueueName.FLEA_MARKET;
    (votingQueue as any).fleaMarketQueue = mockedQueue; 
    
    await votingQueue.addVotingCheckJob({
          voting,
          queue: votingQueueName,
        });

    expect(mockedQueue.add).toHaveBeenCalledWith(
      votingQueueName,
      {
        voting,
        queue: votingQueueName,
      },
      { delay: expect.any(Number) }
    );
  });

  it('addVotingCheckJob | VotingQueueName.Unknown', async () => {
    (votingQueue as any).fleaMarketQueue = mockedQueue; 
    
    try {

    await votingQueue.addVotingCheckJob({
          voting,
          queue: -1 as unknown as VotingQueueName,
        });
      }
    catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain('Unknown queue:');
    }
  });
});
