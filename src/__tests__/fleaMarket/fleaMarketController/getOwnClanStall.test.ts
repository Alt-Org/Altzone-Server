import { FleaMarketController } from '../../../fleaMarket/fleaMarket.controller';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { PlayerService } from '../../../player/player.service';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { ClanService } from '../../../clan/clan.service';
import { User } from '../../../auth/user';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import FleaMarketBuilderFactory from 'src/__tests__/fleaMarket/data/fleaMarketBuilderFactory';
import ClanBuilderFactory from 'src/__tests__/clan/data/clanBuilderFactory';

describe('FleaMarketController.getOwnClanStall() test suite', () => {
  let controller: FleaMarketController;

  let fleaMarketService: jest.Mocked<Partial<FleaMarketService>>;
  let playerService: jest.Mocked<Partial<PlayerService>>;
  let emitterService: jest.Mocked<Partial<EventEmitterService>>;
  let clanService: jest.Mocked<Partial<ClanService>>;

  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const clanBuilder = ClanBuilderFactory.getBuilder('ClanDto');

  const playerId = '69e3e045a752c7ade8734165';
  const clanId = '69e3e045a752c7ade873416f';
  const user = new User('profile-id', playerId, clanId);

  beforeEach(() => {
    fleaMarketService = {
      readMany: jest.fn(),
    };
    playerService = {
      getPlayerClanId: jest.fn(),
    };
    emitterService = {};
    clanService = {
      readOneById: jest.fn(),
    };

    controller = new FleaMarketController(
      fleaMarketService as unknown as FleaMarketService,
      playerService as unknown as PlayerService,
      emitterService as unknown as EventEmitterService,
    );
  });

  it('Should return clan stall data with furniture items accepted for selling', async () => {
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

    const clan = clanBuilder
      .setStall({
        adPoster: {
          border: 'solid',
          colour: 'blue',
          mainFurniture: 'Closet_Rakkaus',
        },
        maxSlots: 7,
      } as any)
      .build();

    playerService.getPlayerClanId.mockResolvedValue(clanId);
    clanService.readOneById.mockResolvedValue([clan, null]);
    fleaMarketService.readMany.mockResolvedValue([[item1, item2], null]);

    const result = await controller.getOwnClanStall(user);

    expect(playerService.getPlayerClanId).toHaveBeenCalledWith(playerId);
    expect(clanService.readOneById).toHaveBeenCalledWith(clanId);
    expect(fleaMarketService.readMany).toHaveBeenCalledWith({
      filter: {
        clan_id: clanId,
        isFurniture: true,
      },
    });
    expect(result).toEqual({
      adPoster: clan.stall.adPoster,
      maxSlots: clan.stall.maxSlots,
      furnitureItems: [item1, item2],
    });
  });

  it('Should throw NOT_AUTHORIZED if player is not in a clan', async () => {
    playerService.getPlayerClanId.mockResolvedValue(undefined);

    await expect(controller.getOwnClanStall(user)).rejects.toMatchObject({
      reason: APIErrorReason.NOT_AUTHORIZED,
      message: 'Player must be a member of a clan to access this resource',
    });
  });

  it('Should return service errors if flea market has no furniture items for the clan', async () => {
    const clan = clanBuilder.build();
    const itemErrors = [
      { message: 'Could not find any objects with specified condition' },
    ] as any;

    playerService.getPlayerClanId.mockResolvedValue(clanId);
    clanService.readOneById.mockResolvedValue([clan, null]);
    fleaMarketService.readMany.mockResolvedValue([null, itemErrors]);

    const result = await controller.getOwnClanStall(user);

    expect(result).toEqual([null, itemErrors]);
  });
});
