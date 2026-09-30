import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';

describe('DailyTasksService.updateClanTask', () => {
  it('progresses INNER_VOICE by clan without a player reservation', async () => {
    const service = new DailyTasksService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        createTaskRandomValues: jest.fn().mockReturnValue({
          type: ServerTaskName.GO_TO_BATTLE,
          amount: 2,
          points: 10,
          coins: 5,
          title: { fi: 'Pelaa 2 taistelua' },
        }),
      } as any,
      {} as any,
    );
    const basicService = {
      readOne: jest.fn().mockResolvedValue([
        {
          _id: 'task-1',
          clan_id: 'clan-1',
          player_id: null,
          type: ServerTaskName.INNER_VOICE,
          amount: 1,
          amountLeft: 1,
          points: 10,
          coins: 5,
        },
        null,
      ]),
      updateOne: jest.fn().mockResolvedValue([true, null]),
    };
    (service as any).basicService = basicService;

    const [result, errors] = await service.updateClanTask(
      'clan-1',
      'player-1',
      ServerTaskName.INNER_VOICE,
      {} as any,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({
      status: 'completed',
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      currentAmountLeft: 0,
    });
    expect(basicService.readOne).toHaveBeenCalledWith({
      filter: {
        clan_id: 'clan-1',
        type: ServerTaskName.INNER_VOICE,
        amountLeft: { $gt: 0 },
      },
      session: expect.anything(),
    });
    expect(basicService.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $unset: { player_id: '', startedAt: '' },
      }),
      expect.objectContaining({
        filter: { _id: 'task-1', clan_id: 'clan-1' },
      }),
    );
  });
});
