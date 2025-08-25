import { ObjectId } from 'mongodb';
import VotingBuilderFactory from '../../voting/data/voting/VotingBuilderFactory';
import FleaMarketModule from '../modules/fleaMarketModule';
import { FleaMarketVotingProcessor } from '../../../fleaMarket/fleaMarketVoting.processor';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';

describe('FleaMarketVotingProcessor.process() test suite', () => {
  let fleaMarketVotingProcessor: FleaMarketVotingProcessor;
  let fleaMarketService: FleaMarketService;

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  beforeEach(async () => {
    fleaMarketVotingProcessor =
      await FleaMarketModule.getFleaMarketVotingProcessor();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
  });

  it('Should call the FleaMarketService.checkVotingOnExpire', async () => {
    const voting = votingBuilder.build();

    const mockedJob: any = {
      data: {
        voting: voting,
        price: 100,
        clanId: new ObjectId(),
        stockId: new ObjectId(),
        fleaMarketItemId: new ObjectId(),
      },
    };

    const ret = jest
      .spyOn(fleaMarketService, 'checkVotingOnExpire')
      .mockResolvedValue(undefined);

    await fleaMarketVotingProcessor.process(mockedJob);

    expect(ret).toHaveBeenCalledTimes(1);
    expect(ret).toHaveBeenCalledWith(mockedJob.data);
  });
});
