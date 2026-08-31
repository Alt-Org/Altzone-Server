import { ClanShopService } from '../../clanShop/clanShop.service';
import { FleaMarketService } from '../../fleaMarket/fleaMarket.service';
import { Status } from '../../fleaMarket/enum/status.enum';

function createSessionMock() {
  return {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
    inTransaction: jest.fn().mockReturnValue(true),
  };
}

function createItem(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => 'item-1' },
    name: 'Sofa_Taakka',
    unityKey: 'Sofa_Taakka',
    isFurniture: true,
    furnitureSize: [2, 2],
    price: 100,
    ...overrides,
  } as any;
}

describe('Stock MQTT service notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes STOCK_ITEM_ADDED after a direct clan shop purchase commits', async () => {
    const session = createSessionMock();
    const createdItem = createItem();
    const stockNotifier = {
      itemAdded: jest.fn(),
      itemRemoved: jest.fn(),
    };
    const service = new ClanShopService(
      {
        readOneById: jest.fn().mockResolvedValue([
          {
            _id: 'clan-1',
            gameCoins: 200,
            Stock: { _id: { toString: () => 'stock-1' } },
          },
          null,
        ]),
        basicService: {
          updateOneById: jest.fn().mockResolvedValue([true, null]),
        },
      } as any,
      {} as any,
      {} as any,
      {
        createOne: jest.fn().mockResolvedValue([createdItem, null]),
      } as any,
      stockNotifier as any,
      {} as any,
      { startSession: jest.fn().mockResolvedValue(session) } as any,
    );

    const [result, errors] = await service['buyDirectly']('clan-1', {
      name: 'Sofa_Taakka',
      price: 100,
    } as any);

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(stockNotifier.itemAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        clan_id: 'clan-1',
        stock_id: 'stock-1',
        source: 'clan_shop_direct',
        item: expect.objectContaining({ _id: 'item-1', isFurniture: true }),
      }),
    );
  });

  it('does not publish stock MQTT for non-furniture clan shop purchases', async () => {
    const session = createSessionMock();
    const stockNotifier = {
      itemAdded: jest.fn(),
      itemRemoved: jest.fn(),
    };
    const service = new ClanShopService(
      {
        readOneById: jest.fn().mockResolvedValue([
          {
            _id: 'clan-1',
            gameCoins: 200,
            Stock: { _id: { toString: () => 'stock-1' } },
          },
          null,
        ]),
        basicService: {
          updateOneById: jest.fn().mockResolvedValue([true, null]),
        },
      } as any,
      {} as any,
      {} as any,
      {
        createOne: jest
          .fn()
          .mockResolvedValue([createItem({ isFurniture: false }), null]),
      } as any,
      stockNotifier as any,
      {} as any,
      { startSession: jest.fn().mockResolvedValue(session) } as any,
    );

    await service['buyDirectly']('clan-1', {
      name: 'Sofa_Taakka',
      price: 100,
    } as any);

    expect(stockNotifier.itemAdded).not.toHaveBeenCalled();
  });

  it('publishes added and removed stock MQTT events for direct flea market purchases between clans', async () => {
    const session = createSessionMock();
    const createdItem = createItem({ _id: { toString: () => 'new-item-1' } });
    const fleaMarketItem = {
      ...createItem({ _id: { toString: () => 'fm-item-1' } }),
      clan_id: { toString: () => 'seller-clan' },
      status: Status.AVAILABLE,
    };
    const stockNotifier = {
      itemAdded: jest.fn(),
      itemRemoved: jest.fn(),
    };
    const model = {};
    const service = new FleaMarketService(
      model as any,
      {
        fleaMarketItemToCreateItemDto: jest.fn().mockReturnValue({
          ...createdItem,
          stock_id: 'buyer-stock',
        }),
      } as any,
      {} as any,
      {} as any,
      {
        createOne: jest.fn().mockResolvedValue([createdItem, null]),
      } as any,
      stockNotifier as any,
      {} as any,
      {} as any,
      {
        readOneById: jest.fn().mockResolvedValue([
          {
            _id: 'buyer-clan',
            gameCoins: 200,
            Stock: { _id: { toString: () => 'buyer-stock' } },
          },
          null,
        ]),
        updateOne: jest.fn().mockResolvedValue([true, null]),
      } as any,
      { startSession: jest.fn().mockResolvedValue(session) } as any,
    );
    service.readOneById = jest.fn().mockResolvedValue([fleaMarketItem, null]);
    service.basicService.deleteOneById = jest
      .fn()
      .mockResolvedValue([true, null]);

    const [result, errors] = await service['buyDirectly'](
      'buyer-clan',
      'fm-item-1',
    );

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(stockNotifier.itemAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        clan_id: 'buyer-clan',
        stock_id: 'buyer-stock',
        source: 'flea_market_direct',
        sellerClan_id: 'seller-clan',
        fleaMarketItem_id: 'fm-item-1',
      }),
    );
    expect(stockNotifier.itemRemoved).toHaveBeenCalledWith(
      expect.objectContaining({
        clan_id: 'seller-clan',
        source: 'flea_market_direct',
        sellerClan_id: 'seller-clan',
        buyerClan_id: 'buyer-clan',
        fleaMarketItem_id: 'fm-item-1',
      }),
    );
  });

  it('does not publish stock MQTT when a flea market buy voting is rejected', async () => {
    const session = createSessionMock();
    const stockNotifier = {
      itemAdded: jest.fn(),
      itemRemoved: jest.fn(),
    };
    const service = new FleaMarketService(
      { db: { startSession: jest.fn().mockResolvedValue(session) } } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      stockNotifier as any,
      {} as any,
      {} as any,
      {
        readOneById: jest.fn().mockResolvedValue([
          {
            gameCoins: 100,
          },
          null,
        ]),
        updateOne: jest.fn().mockResolvedValue([true, null]),
      } as any,
      {} as any,
    );
    service.basicService.updateOneById = jest
      .fn()
      .mockResolvedValue([true, null]);

    const [result, errors] = await service['handleRejectedBuyVoting'](
      { fleaMarketItem_id: 'fm-item-1' } as any,
      'buyer-clan',
      50,
    );

    expect(errors).toBeNull();
    expect(result).toBe(true);
    expect(stockNotifier.itemAdded).not.toHaveBeenCalled();
    expect(stockNotifier.itemRemoved).not.toHaveBeenCalled();
  });
});
