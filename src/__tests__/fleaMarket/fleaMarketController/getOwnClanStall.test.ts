import { FleaMarketController } from '../../../fleaMarket/fleaMarket.controller';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { PlayerService } from '../../../player/player.service';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { User } from '../../../auth/user';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import { StallResponse } from '../../../fleaMarket/stall/dto/stallResponse.dto';
import { IServiceReturn } from '../../../common/service/basicService/IService';
import ServiceError from '../../../common/service/basicService/ServiceError';

describe('FleaMarketController.getOwnClanStall() test suite', () => {
  let controller: FleaMarketController;

  let fleaMarketService: jest.Mocked<Partial<FleaMarketService>>;
  let playerService: jest.Mocked<Partial<PlayerService>>;
  let emitterService: jest.Mocked<Partial<EventEmitterService>>;

  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');

  const playerId = '69e3e045a752c7ade8734165';
  const clanId = '69e3e045a752c7ade873416f';
  const user = new User('profile-id', playerId, clanId);

  beforeEach(() => {
    fleaMarketService = {
      getClanFurnitureItems: jest.fn(),
    };
    playerService = {
      getPlayerClanId: jest.fn(),
    };
    emitterService = {};

    controller = new FleaMarketController(
      fleaMarketService as unknown as FleaMarketService,
      playerService as unknown as PlayerService,
      emitterService as unknown as EventEmitterService,
    );
  });

  it("Should return clan furniture items whether they're in the stall or not", async () => {
    const item1 = fleaMarketItemBuilder
      .setId('item-1')
      .setClanId(clanId)
      .setIsFurniture(true)
      .build();
    const item2 = fleaMarketItemBuilder
      .setId('item-2')
      .setClanId(clanId)
      .setIsFurniture(true)
      .build();

    playerService.getPlayerClanId.mockResolvedValue(clanId);

    const serviceReturn: IServiceReturn<StallResponse> = [
      { furnitureItems: ['item-1', 'item-2'] },
      null,
    ];
    fleaMarketService.getClanFurnitureItems.mockResolvedValue(serviceReturn);

    const result = await controller.getOwnClanStall(user);

    // check that the created items are returned in the response
    expect(result[0]).toBeDefined();
    expect(result[0].furnitureItems).toHaveLength(2);
    expect(result[0].furnitureItems).toEqual(
      expect.arrayContaining(['item-1', 'item-2']),
    );
  });

  it('Should throw NOT_AUTHORIZED if player is not in a clan', async () => {
    playerService.getPlayerClanId.mockResolvedValue(undefined);

    await expect(controller.getOwnClanStall(user)).rejects.toMatchObject({
      reason: APIErrorReason.NOT_AUTHORIZED,
      message: 'Player must be a member of a clan to access this resource',
    });
  });

  it('Should return service errors if flea market has no furniture items for the clan', async () => {
    const itemErrors: ServiceError[] = [
      { message: 'Could not find any objects with specified condition' },
    ] as unknown as ServiceError[];

    playerService.getPlayerClanId.mockResolvedValue(clanId);

    const serviceReturn: IServiceReturn<StallResponse> = [null, itemErrors];
    fleaMarketService.getClanFurnitureItems.mockResolvedValue(serviceReturn);

    const result = await controller.getOwnClanStall(user);

    expect(result).toEqual([null, itemErrors]);
  });
});
