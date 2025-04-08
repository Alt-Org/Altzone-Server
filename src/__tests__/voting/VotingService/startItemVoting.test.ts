import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { PlayerDto } from '../../../player/dto/player.dto';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';
import { VotingType } from '../../../voting/enum/VotingType.enum';

describe('VotingService.startItemVoting() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder('CreateStartItemVotingParamsDto');

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  it('Should create a startItemVoting in DB if input is valid', async () => {
    const minPercentage = 1;
    const player = VotingBuilderFactory.getBuilder('CreatePlayerDtoBuilder').build() as PlayerDto;
    const fleaMarketItem = VotingBuilderFactory.getBuilder('FleaMarketItemDto')
    .build() as FleaMarketItemDto;
    const votingType = VotingType.SELLING_ITEM
    const startItemVotingParamsToCreate = votingBuilder
      .setPlayer(player)
      .setItem(fleaMarketItem)
      .setType(votingType)
      .build();

    await votingService.startItemVoting(startItemVotingParamsToCreate);

    const dbData = await votingModel.findOne({ type: votingType });

    const {type } = clearDBRespDefaultFields(dbData);

    //const { _id  } = { ...startItemVotingParamsToCreate };

    expect(type.toString()).toBe(votingType.toString());

  });
});
