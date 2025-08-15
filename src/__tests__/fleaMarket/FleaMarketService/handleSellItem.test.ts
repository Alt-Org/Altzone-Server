import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import FleaMarketModule from '../modules/fleaMarketModule';
import { ItemService } from '../../../clanInventory/item/item.service';
import { PlayerService } from '../../../player/player.service';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { VotingService } from '../../../voting/voting.service';
import VotingBuilderFactory from '../../voting/data/VotingBuilderFactory';
import { VotingQueue } from '../../../voting/voting.queue';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';
import createMockSession from '../../common/MongooseSession/CreateMockSession';
import { Model } from 'mongoose';
import { FleaMarketItem } from '../../../fleaMarket/fleaMarketItem.schema';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';

describe('FleaMarketService.handleSellItem() test suit', () => {
  let fleaMarketService: FleaMarketService;
  let itemService: ItemService;
  let playerService: PlayerService;
  let helperService: FleaMarketHelperService;
  let votingService: VotingService;
  let votingQueue: VotingQueue;
  let model: Model<FleaMarketItem>;

  let sessionMock: any;

  const itemDtoBuilder = ClanInventoryBuilderFactory.getBuilder('ItemDto');
  const itemIdDtoBuilder = FleaMarketBuilderFactory.getBuilder(
    'SellFleaMarketItemDto',
  );

  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');

  const itemDto = itemDtoBuilder.setStockId('stock123').build();
  const itemIdDto = itemIdDtoBuilder.setItemId('item').build();
  const createdFleaMarketItemDto = fleaMarketItemBuilder.build();
  const PlayerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');

  const clanId = 'clan';
  const playerId = 'player';
  const playerDto = PlayerDtoBuilder.setClanId(clanId).build();
  const error = [];

  const newItem = fleaMarketItemBuilder.build();

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const votingDto = votingBuilder.build();

  beforeEach(async () => {
    jest.clearAllMocks();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    itemService = await FleaMarketModule.getItemService();
    playerService = await FleaMarketModule.getPlayerService();
    helperService = await FleaMarketModule.getFleaMarketHelperService();
    votingService = await FleaMarketModule.getVotingService();
    votingQueue = await FleaMarketModule.getVotingQueue();
    model = fleaMarketService.model;

    sessionMock = createMockSession(model);

    jest.spyOn(itemService, 'readOneById').mockResolvedValue([itemDto, null]);
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);
    jest
      .spyOn(helperService, 'itemToCreateFleaMarketItem')
      .mockResolvedValue(newItem);
    jest
      .spyOn(fleaMarketService, 'createOne')
      .mockResolvedValue([createdFleaMarketItemDto, null]);
    jest.spyOn(itemService, 'deleteOneById').mockResolvedValue([true, null]);
  });

  it('Should process selling item and add voting check job', async () => {
    const newItem = fleaMarketItemBuilder
      .setName(itemIdDto.item_id as ItemName)
      .build();

    jest
      .spyOn(helperService, 'itemToCreateFleaMarketItem')
      .mockResolvedValue(newItem);

    jest
      .spyOn(fleaMarketService.basicService, 'updateOneById')
      .mockResolvedValue([null, null]);

    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([votingDto, null]);
    const addVotingCheckJob = jest
      .spyOn(votingQueue, 'addVotingCheckJob')
      .mockImplementation();

    await fleaMarketService.handleSellItem(itemIdDto, clanId, playerId);

    expect(itemService.readOneById).toHaveBeenCalledWith(itemIdDto.item_id);
    expect(playerService.getPlayerById).toHaveBeenCalledWith(playerId);
    expect(helperService.itemToCreateFleaMarketItem).toHaveBeenCalledWith(
      itemDto,
      clanId,
    );
    expect(itemService.deleteOneById).toHaveBeenCalledWith(itemIdDto.item_id);
    expect(sessionMock.startTransaction).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(sessionMock.endSession).toHaveBeenCalled();
    expect(votingService.startVoting).toHaveBeenCalledWith({
      voterPlayer: playerDto,
      type: 'flea_market_sell_item',
      clanId,
      fleaMarketItem: createdFleaMarketItemDto,
      queue: 'flea_market',
    });
    expect(addVotingCheckJob).toHaveBeenCalledWith(
      expect.objectContaining({
        voting: expect.objectContaining({
          _id: expect.any(String),
        }),
        fleaMarketItemId: expect.any(String),
        stockId: expect.any(String),
        queue: expect.any(String),
      }),
    );
  });

  it('Should throw exception if itemService.readOneById returns error', async () => {
    jest.spyOn(itemService, 'readOneById').mockResolvedValue([null, error]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if item has no stock_id', async () => {
    const itemDto2 = itemDtoBuilder.setStockId(null).build();

    jest.spyOn(itemService, 'readOneById').mockResolvedValue([itemDto2, null]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if playerService.getPlayerById returns error', async () => {
    jest.spyOn(playerService, 'getPlayerById').mockResolvedValue([null, error]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if votingService.startVoting returns error', async () => {
    jest.spyOn(votingService, 'startVoting').mockResolvedValue([null, error]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if createOne fails in moveItemToFleaMarket', async () => {
    jest.spyOn(fleaMarketService, 'createOne').mockResolvedValue([null, error]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if deleteOneById fails in moveItemToFleaMarket', async () => {
    jest.spyOn(itemService, 'deleteOneById').mockResolvedValue([null, error]);

    const [ret, err] = await fleaMarketService.handleSellItem(
      itemIdDto,
      clanId,
      playerId,
    );
    expect(ret).toBe(false);
    expect(err).toBeDefined();
  });

  it('Should throw exception if addVotingCheckJob throws error', async () => {
    const error = new Error('addVotingCheckJob error');

    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([votingDto, null]);
    jest.spyOn(votingQueue, 'addVotingCheckJob').mockImplementation(() => {
      throw error;
    });

    try {
      await fleaMarketService.handleSellItem(itemIdDto, clanId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('Should throw exception if helperService.itemToCreateFleaMarketItem throws error', async () => {
    const error = new Error('helper error');

    jest
      .spyOn(helperService, 'itemToCreateFleaMarketItem')
      .mockImplementation(() => {
        throw error;
      });

    try {
      await fleaMarketService.handleSellItem(itemIdDto, clanId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });
});
