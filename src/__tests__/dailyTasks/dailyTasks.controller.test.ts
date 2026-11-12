import { DailyTasksController } from '../../dailyTasks/dailyTasks.controller';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

describe('DailyTasksController.getClanTasks()', () => {
  const createController = (readManyResult: any) => {
    const dailyTasksService = {
      readMany: jest.fn().mockResolvedValue(readManyResult),
    };
    const playerService = {
      getPlayerClanId: jest.fn().mockResolvedValue('clan-id'),
    };
    const controller = new DailyTasksController(
      dailyTasksService as any,
      playerService as any,
      {} as any,
    );

    return { controller, dailyTasksService };
  };

  it('returns an empty list when the clan has no daily tasks', async () => {
    const notFound = new ServiceError({ reason: SEReason.NOT_FOUND });
    const { controller, dailyTasksService } = createController([
      null,
      [notFound],
    ]);

    const result = await controller.getClanTasks({
      player_id: 'player-id',
    } as any);

    expect(result).toEqual([[], null]);
    expect(dailyTasksService.readMany).toHaveBeenCalledWith({
      filter: { clan_id: 'clan-id' },
    });
  });

  it('keeps non-not-found errors unchanged', async () => {
    const unexpected = new ServiceError({ reason: SEReason.UNEXPECTED });
    const { controller } = createController([null, [unexpected]]);

    const result = await controller.getClanTasks({
      player_id: 'player-id',
    } as any);

    expect(result).toEqual([null, [unexpected]]);
  });
});
