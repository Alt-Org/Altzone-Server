import { ObjectId } from 'mongodb';
import VotingBuilderFactory from '../../voting/data/VotingBuilderFactory';
import FleaMarketModule from '../modules/fleaMarketModule';

describe('FleaMarketVotingProcessor.process() test suite', () => {
  let fleaMarketVotingProcessor;
  let fleaMarketService;

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
