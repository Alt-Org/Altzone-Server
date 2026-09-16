import { FleaMarketController } from '../../../fleaMarket/fleaMarket.controller';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { PlayerService } from '../../../player/player.service';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { User } from '../../../auth/user';
import { Status } from '../../../fleaMarket/enum/status.enum';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import ServiceError from '../../../common/service/basicService/ServiceError';

describe('FleaMarketController.changeItemStatus() daily task progress', () => {
  let controller: FleaMarketController;
  let fleaMarketService: any;
  let emitterService: jest.Mocked<Partial<EventEmitterService>>;

  const itemId = 'flea-market-item';
  const playerId = '69e3e045a752c7ade8734165';
  const clanId = '69e3e045a752c7ade873416f';
  const user = new User('profile-id', playerId, clanId);

  beforeEach(() => {
    fleaMarketService = {
      readOneById: jest.fn(),
      getFleaMarketItemClanId: jest.fn(),
      checkClanItemSlots: jest.fn(),
      basicService: {
        updateOneById: jest.fn(),
      },
    };
    emitterService = {
      EmitNewDailyTaskEvent: jest.fn(),
    };

    controller = new FleaMarketController(
      fleaMarketService as FleaMarketService,
      {} as PlayerService,
      emitterService as unknown as EventEmitterService,
    );

    fleaMarketService.getFleaMarketItemClanId.mockResolvedValue(clanId);
    fleaMarketService.checkClanItemSlots.mockResolvedValue([true, null]);
    fleaMarketService.basicService.updateOneById.mockResolvedValue([
      null,
      null,
    ]);
  });

  it('progresses RECYCLING_EXPERIENCES when an approved item is listed for sale', async () => {
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: clanId,
        status: Status.AVAILABLE,
        saleApprovedByVoting: true,
      },
      null,
    ]);

    await controller.changeItemStatus(
      { item_id: itemId, status: Status.SHIPPING },
      user,
    );

    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      playerId,
      ServerTaskName.RECYCLING_EXPERIENCES,
    );
  });

  it('does not progress the task when the status change is not listing an approved item', async () => {
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: clanId,
        status: Status.SHIPPING,
        saleApprovedByVoting: true,
      },
      null,
    ]);

    await controller.changeItemStatus(
      { item_id: itemId, status: Status.AVAILABLE },
      user,
    );

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when the item was not approved by sell-item voting', async () => {
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: clanId,
        status: Status.AVAILABLE,
        saleApprovedByVoting: false,
      },
      null,
    ]);

    await controller.changeItemStatus(
      { item_id: itemId, status: Status.SHIPPING },
      user,
    );

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when the status update fails', async () => {
    const updateError = [new ServiceError({ message: 'update failed' })];
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: clanId,
        status: Status.AVAILABLE,
        saleApprovedByVoting: true,
      },
      null,
    ]);
    fleaMarketService.basicService.updateOneById.mockResolvedValue([
      null,
      updateError,
    ]);

    await expect(
      controller.changeItemStatus(
        { item_id: itemId, status: Status.SHIPPING },
        user,
      ),
    ).rejects.toBe(updateError);

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when the item belongs to another clan', async () => {
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: 'other-clan',
        status: Status.AVAILABLE,
        saleApprovedByVoting: true,
      },
      null,
    ]);
    fleaMarketService.getFleaMarketItemClanId.mockResolvedValue(null);

    await expect(
      controller.changeItemStatus(
        { item_id: itemId, status: Status.SHIPPING },
        user,
      ),
    ).rejects.toMatchObject({
      reason: APIErrorReason.NOT_AUTHORIZED,
    });

    expect(fleaMarketService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when the item is booked', async () => {
    fleaMarketService.readOneById.mockResolvedValue([
      {
        _id: itemId,
        clan_id: clanId,
        status: Status.BOOKED,
        saleApprovedByVoting: true,
      },
      null,
    ]);

    await expect(
      controller.changeItemStatus(
        { item_id: itemId, status: Status.SHIPPING },
        user,
      ),
    ).rejects.toMatchObject({
      reason: APIErrorReason.NOT_ALLOWED,
    });

    expect(fleaMarketService.basicService.updateOneById).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress RECYCLING_EXPERIENCES when proposing an item for sale', async () => {
    fleaMarketService.getClanId = jest.fn().mockResolvedValue(clanId);
    fleaMarketService.handleSellItem = jest
      .fn()
      .mockResolvedValue([true, null]);

    await controller.sell({ item_id: itemId, price: 100 }, user);

    expect(fleaMarketService.handleSellItem).toHaveBeenCalledWith(
      { item_id: itemId, price: 100 },
      clanId,
      playerId,
    );
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });
});
