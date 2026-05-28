import { ObjectId } from 'mongodb';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { VotingService } from '../../../voting/voting.service';
import VotingModule from '../modules/voting.module';

describe('VotingService.finalizeVoting() test suite', () => {
  let votingService: VotingService;

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  const createClanShopVoting = async (endedAt?: Date) => {
    return await votingService.votingModel.create({
      organizer: {
        player_id: new ObjectId(),
        clan_id: new ObjectId(),
      },
      endsOn: new Date(Date.now() + 3600000),
      type: VotingType.SHOP_BUY_ITEM,
      minPercentage: 51,
      votes: [],
      shopItemName: ItemName.SOFA_TAAKKA,
      endedAt,
    });
  };

  it('Should set endedAt and send completed notification for active voting', async () => {
    const voting = await createClanShopVoting();
    expect(voting.shopItemName).toBe(ItemName.SOFA_TAAKKA);
    const votingCompletedSpy = jest
      .spyOn((votingService as any).notifier, 'votingCompleted')
      .mockResolvedValue(undefined);

    await votingService.finalizeVoting(voting._id.toString());

    const votingFromDb = await votingService.votingModel.findById(voting._id);

    expect(votingFromDb.endedAt).toBeInstanceOf(Date);
    expect(votingCompletedSpy).toHaveBeenCalledTimes(1);
    expect(votingCompletedSpy.mock.calls[0][1]).toEqual({
      shopItemName: ItemName.SOFA_TAAKKA,
    });
  });

  it('Should not send completed notification if voting is already finalized', async () => {
    const voting = await createClanShopVoting(new Date());
    const votingCompletedSpy = jest
      .spyOn((votingService as any).notifier, 'votingCompleted')
      .mockResolvedValue(undefined);

    await votingService.finalizeVoting(voting._id.toString());

    expect(votingCompletedSpy).not.toHaveBeenCalled();
  });
});
