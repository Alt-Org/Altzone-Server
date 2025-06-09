import { ObjectId } from 'mongodb';
import { ClanShopService } from '../../../clanShop/clanShop.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import VotingBuilderFactory from '../../voting/data/VotingBuilderFactory';
import ClanShopModule from '../modules/clanShop.module';
import LoggedUser from '../../test_utils/const/loggedUser';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import { VoteChoice } from '../../../voting/enum/choiceType.enum';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { itemProperties } from '../../../clanInventory/item/const/itemProperties';

jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    end: jest.fn(),
    publishAsync: jest.fn(),
  })),
}));

describe('ClanShopService.checkVotingOnExpire() test suite', () => {
  let clanShopService: ClanShopService;

  const clanModel = ClanShopModule.getClanModel();
  const votingModel = ClanShopModule.getVotingModel();
  const itemModel = ClanShopModule.getItemModel();
  const stockModel = ClanShopModule.getStockModel();
  const playerModel = ClanShopModule.getPlayerModel();

  const clanCreateBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanName = 'clan1';
  const clanToCreate = clanCreateBuilder
    .setName(clanName)
    .setGameCoins(1000)
    .build();

  const itemBuilder = FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const item = itemBuilder.build();

  const player = LoggedUser.getPlayer();
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockToCreate = stockBuilder.build();

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const voteBuilder = VotingBuilderFactory.getBuilder('Vote');

  beforeEach(async () => {
    clanShopService = await ClanShopModule.getClanShopService();

    // Create clan
    const createdClan = await clanModel.create(clanToCreate);
    clanToCreate._id = createdClan._id;

    // Assign player to clan
    await playerModel.findByIdAndUpdate(player._id, {
      clan_id: createdClan._id,
    });

    // Create stock for the clan
    stockToCreate.clan_id = createdClan;
    const createdStock = await stockModel.create(stockToCreate);
    stockToCreate._id = createdStock._id;
  });

  it('Should process a successful vote and create an item', async () => {
    const voteToCreate = voteBuilder
      .setChoice(VoteChoice.YES)
      .setPlayerId(new ObjectId().toString())
      .build();
    const votingToCreate = votingBuilder
      .addVote(voteToCreate)
      .setShopItemName(item.name)
      .build();
    const createdVoting = await votingModel.create(votingToCreate);

    await expect(
      clanShopService.checkVotingOnExpire({
        voting: votingToCreate,
        stockId: stockToCreate._id,
        queue: VotingQueueName.CLAN_SHOP,
        price: item.price,
        clanId: clanToCreate._id,
      }),
    ).resolves.not.toThrow();

    const votingExists = await votingModel.findById(createdVoting._id);
    expect(votingExists).toBeNull();

    const dbItem = await itemModel.find();
    expect(dbItem[0]).toMatchObject(itemProperties[item.name]);
  });

  it('Should process a rejected vote and return funds to the clan', async () => {
    const failingVoteToCreate = voteBuilder
      .setChoice(VoteChoice.NO)
      .setPlayerId(new ObjectId().toString())
      .build();
    const failingVoteToCreate2 = voteBuilder
      .setChoice(VoteChoice.NO)
      .setPlayerId(new ObjectId().toString())
      .build();
    const failingVotingToCreate = votingBuilder
      .setShopItemName(item.name)
      .addVote(failingVoteToCreate)
      .addVote(failingVoteToCreate2)
      .build();
    const createdVoting = await votingModel.create(failingVotingToCreate);
    const clan = await clanModel.findOne();

    await expect(
      clanShopService.checkVotingOnExpire({
        voting: failingVotingToCreate,
        price: 100,
        clanId: clanToCreate._id.toString(),
        queue: VotingQueueName.CLAN_SHOP,
        stockId: new ObjectId().toString(),
      }),
    ).resolves.not.toThrow();

    const votingExists = await votingModel.findById(createdVoting._id);
    expect(votingExists).toBeNull();
    const clan2 = await clanModel.findOne();
    expect(clan.gameCoins).toEqual(clan2.gameCoins - 100);
  });
});
