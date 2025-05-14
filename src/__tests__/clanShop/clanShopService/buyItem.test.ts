import { ClanShopService } from '../../../clanShop/clanShop.service';
import ClanShopModule from '../modules/clanShop.module';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { itemProperties } from '../../../clanInventory/item/const/itemProperties';
import StockBuilder from '../../clanInventory/data/stock/StockBuilder';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { ObjectId } from 'mongodb';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { VotingDto } from '../../../voting/dto/voting.dto';

jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    end: jest.fn(),
    publishAsync: jest.fn(),
  })),
}));

describe('ClanShopService.buyItem() test suite', () => {
  let clanShopService: ClanShopService;

  const playerModel = ClanShopModule.getPlayerModel();
  const clanModel = ClanShopModule.getClanModel();
  const stockModel = ClanShopModule.getStockModel();
  const votingModel = ClanShopModule.getVotingModel();

  const clanCreateBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanName = 'clan1';
  const clanToCreate = clanCreateBuilder.setName(clanName).build();

  const playerCreateBuilder = PlayerBuilderFactory.getBuilder('Player');
  const playerToCreate = playerCreateBuilder
    .setName('ClanShopPlayer')
    .setClanId(clanToCreate._id)
    .build();

  const stockBuilder = new StockBuilder();
  const stockToCreate = stockBuilder.setClanId(clanToCreate._id).build();

  beforeEach(async () => {
    clanShopService = await ClanShopModule.getClanShopService();
  });

  it('Should successfully start the item buying vote', async () => {
    const createdClan = await clanModel.create(clanToCreate);
    const createdPlayer = await playerModel.create(playerToCreate);
    const itemToBuy = itemProperties['ArmChair_Kylmä_Tulevaisuus'];

    stockToCreate.clan_id = createdClan;
    const stock = await stockModel.create(stockToCreate);
    await clanModel.updateOne(
      { _id: createdClan._id },
      { gameCoins: itemToBuy.price + 1 },
    );

    jest
      .spyOn(clanShopService['votingQueue'], 'addVotingCheckJob')
      .mockResolvedValue();

    await expect(
      clanShopService.buyItem(
        createdPlayer._id.toString(),
        createdClan._id.toString(),
        itemToBuy,
      ),
    ).resolves.not.toThrow();
    const voting = await votingModel.find<VotingDto>();
    expect(
      clanShopService['votingQueue'].addVotingCheckJob,
    ).toHaveBeenCalledWith({
      voting: expect.objectContaining({
        _id: voting[0]._id,
      }),
      stockId: stock._id,
      price: itemToBuy.price,
      queue: VotingQueueName.CLAN_SHOP,
    });
    expect(voting.length).toEqual(1);
  });

  it('Should throw an error if the clan has insufficient funds', async () => {
    const createdClan = await clanModel.create(clanToCreate);
    const createdPlayer = await playerModel.create(playerToCreate);
    const itemToBuy = itemProperties['ArmChair_Kylmä_Tulevaisuus'];

    stockToCreate.clan_id = createdClan;
    await stockModel.create(stockToCreate);

    // Set insufficient funds
    await clanModel.updateOne(
      { _id: createdClan._id },
      { gameCoins: itemToBuy.price - 1 },
    );

    await expect(
      clanShopService.buyItem(
        createdPlayer._id.toString(),
        createdClan._id.toString(),
        itemToBuy,
      ),
    ).rejects.toEqual([
      {
        additional: null,
        field: 'gameCoins',
        message: 'Clan does not have enough coins to buy the item',
        reason: 'LESS_THAN_MIN',
        value: null,
      },
    ]);
  });

  it('Should throw an error if the clan does not exist', async () => {
    const itemToBuy = itemProperties['ArmChair_Kylmä_Tulevaisuus'];

    await expect(
      clanShopService.buyItem(
        new ObjectId().toString(),
        new ObjectId().toString(),
        itemToBuy,
      ),
    ).rejects.toContainSE_NOT_FOUND();
  });

  it('Should throw an error if the player does not exist', async () => {
    const createdClan = await clanModel.create(clanToCreate);
    const itemToBuy = itemProperties['ArmChair_Kylmä_Tulevaisuus'];

    stockToCreate.clan_id = createdClan;
    await stockModel.create(stockToCreate);

    await clanModel.updateOne(
      { _id: createdClan._id },
      { gameCoins: itemToBuy.price + 1 },
    );

    await expect(
      clanShopService.buyItem(
        new ObjectId().toString(),
        createdClan._id.toString(),
        itemToBuy,
      ),
    ).rejects.toContainSE_NOT_FOUND();
  });

  it('Should throw an error if the voting process fails', async () => {
    const createdClan = await clanModel.create(clanToCreate);
    const createdPlayer = await playerModel.create(playerToCreate);
    const itemToBuy = itemProperties['ArmChair_Kylmä_Tulevaisuus'];

    stockToCreate.clan_id = createdClan;
    await stockModel.create(stockToCreate);

    await clanModel.updateOne(
      { _id: createdClan._id },
      { gameCoins: itemToBuy.price + 1 },
    );

    jest
      .spyOn(clanShopService['votingService'], 'startItemVoting')
      .mockResolvedValue([
        null,
        [new ServiceError({ reason: SEReason.UNEXPECTED })],
      ]);

    await expect(
      clanShopService.buyItem(
        createdPlayer._id.toString(),
        createdClan._id.toString(),
        itemToBuy,
      ),
    ).rejects.toContainSE_UNEXPECTED();
  });
});
