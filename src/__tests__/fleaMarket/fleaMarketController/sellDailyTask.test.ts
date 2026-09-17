import { User } from '../../../auth/user';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { ServerTaskName } from '../../../dailyTasks/enum/serverTaskName.enum';
import { FleaMarketController } from '../../../fleaMarket/fleaMarket.controller';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import { SellItemResult } from '../../../fleaMarket/enum/sellItemResult.enum';
import { PlayerService } from '../../../player/player.service';

describe('FleaMarketController.sell() daily task progress', () => {
  let controller: FleaMarketController;
  let fleaMarketService: jest.Mocked<Partial<FleaMarketService>>;
  let emitterService: jest.Mocked<Partial<EventEmitterService>>;

  const itemId = 'clan-item';
  const playerId = '69e3e045a752c7ade8734165';
  const clanId = '69e3e045a752c7ade873416f';
  const user = new User('profile-id', playerId, clanId);
  const sellItem = { item_id: itemId, price: 100 };

  beforeEach(() => {
    fleaMarketService = {
      getClanId: jest.fn().mockResolvedValue(clanId),
      handleSellItem: jest.fn(),
    };
    emitterService = {
      EmitNewDailyTaskEvent: jest.fn().mockResolvedValue(undefined),
    };

    controller = new FleaMarketController(
      fleaMarketService as unknown as FleaMarketService,
      {} as PlayerService,
      emitterService as unknown as EventEmitterService,
    );
  });

  it('progresses LETTING_GO_OF_THE_OLD after sell-item voting starts', async () => {
    fleaMarketService.handleSellItem.mockResolvedValue([
      SellItemResult.VOTING_STARTED,
      null,
    ]);

    await controller.sell(sellItem, user);

    expect(fleaMarketService.handleSellItem).toHaveBeenCalledWith(
      sellItem,
      clanId,
      playerId,
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      playerId,
      ServerTaskName.LETTING_GO_OF_THE_OLD,
    );
    expect(
      emitterService.EmitNewDailyTaskEvent.mock.invocationCallOrder[0],
    ).toBeGreaterThan(
      fleaMarketService.handleSellItem.mock.invocationCallOrder[0],
    );
  });

  it('does not progress the task for a direct sale', async () => {
    fleaMarketService.handleSellItem.mockResolvedValue([
      SellItemResult.SOLD_DIRECTLY,
      null,
    ]);

    await controller.sell(sellItem, user);

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when starting the voting fails', async () => {
    const errors = [new ServiceError({ message: 'voting creation failed' })];
    fleaMarketService.handleSellItem.mockResolvedValue([null, errors]);

    await expect(controller.sell(sellItem, user)).resolves.toBe(errors);

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not progress the task when the item is outside the current clan', async () => {
    fleaMarketService.getClanId.mockResolvedValue(null);

    await expect(controller.sell(sellItem, user)).rejects.toMatchObject({
      reason: APIErrorReason.NOT_AUTHORIZED,
    });

    expect(fleaMarketService.handleSellItem).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });
});
