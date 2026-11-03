import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';

describe('DailyTasksService.updateClanTask', () => {
  it('progresses UPDATE_CLAN_MOTTO by clan without a player reservation', async () => {
    const model = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue({
          _id: 'task-1',
          clan_id: 'clan-1',
          player_id: null,
          type: ServerTaskName.UPDATE_CLAN_MOTTO,
          amount: 1,
          amountLeft: 0,
          points: 10,
          coins: 5,
        }),
      })),
    };
    const service = new DailyTasksService(
      model as any,
      {} as any,
      {} as any,
      {} as any,
      {
        createTaskRandomValues: jest.fn().mockReturnValue({
          type: ServerTaskName.PLAY_A_BATTLE,
          amount: 2,
          points: 10,
          coins: 5,
          title: { fi: 'Pelaa 2 taistelua' },
        }),
      } as any,
      {} as any,
      {} as any,
    );
    const basicService = {
      updateOne: jest.fn().mockResolvedValue([true, null]),
    };
    (service as any).basicService = basicService;

    const [result, errors] = await service.updateClanTask(
      'clan-1',
      'player-1',
      ServerTaskName.UPDATE_CLAN_MOTTO,
      {} as any,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({
      status: 'completed',
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      currentAmountLeft: 0,
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      {
        clan_id: 'clan-1',
        type: ServerTaskName.UPDATE_CLAN_MOTTO,
        amountLeft: { $gt: 0 },
        isRewarded: { $ne: true },
      },
      expect.any(Array),
      expect.objectContaining({ new: true, session: expect.anything() }),
    );
    expect(basicService.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $unset: { player_id: '', startedAt: '' },
      }),
      expect.objectContaining({
        filter: {
          _id: 'task-1',
          clan_id: 'clan-1',
          isRewarded: true,
        },
      }),
    );
  });
});
