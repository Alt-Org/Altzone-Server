import { Connection } from 'mongoose';
import { DailyTasksService } from '../../dailyTasks/dailyTasks.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';
import { StrongerSoldierStep } from '../../dailyTasks/enum/strongerSoldierStep.enum';

describe('STRONGER_SOLDIER daily task', () => {
  const createService = (updatedTask: any = null) => {
    const model = {
      findOneAndUpdate: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue(updatedTask),
      })),
    };
    const progressService = { handleProgress: jest.fn() };
    const service = new DailyTasksService(
      model as any,
      {} as Connection,
      {} as any,
      {} as any,
      {
        createTaskRandomValues: jest.fn().mockReturnValue({
          type: ServerTaskName.GO_TO_BATTLE,
          amount: 2,
          points: 10,
          coins: 5,
          title: { fi: 'Pelaa 2 taistelua' },
          timeLimitMinutes: 4,
        }),
      } as any,
      progressService as any,
    );
    const basicService = {
      updateOne: jest.fn().mockResolvedValue([true, null]),
    };
    (service as any).basicService = basicService;

    return { basicService, model, progressService, service };
  };

  it('advances the first step only from the initial amount', async () => {
    const updatedTask = {
      _id: 'task-1',
      clan_id: 'clan-1',
      amountLeft: 1,
    };
    const { model, service } = createService(updatedTask);

    const [result, errors] = await service.updateStrongerSoldierTask(
      'player-1',
      StrongerSoldierStep.ATTACK_INCREASED,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({
      status: 'advanced',
      previousAmountLeft: 2,
      currentAmountLeft: 1,
      completedAmount: 1,
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      {
        player_id: 'player-1',
        type: ServerTaskName.STRONGER_SOLDIER,
        amountLeft: 2,
      },
      { $inc: { amountLeft: -1 } },
      expect.objectContaining({ new: true }),
    );
  });

  it('completes only a task whose first step is already done', async () => {
    const updatedTask = {
      _id: 'task-1',
      clan_id: 'clan-1',
      amountLeft: 0,
    };
    const { basicService, model, service } = createService(updatedTask);

    const [result, errors] = await service.updateStrongerSoldierTask(
      'player-1',
      StrongerSoldierStep.BATTLE_PLAYED,
    );

    expect(errors).toBeNull();
    expect(result).toMatchObject({
      status: 'completed',
      previousAmountLeft: 1,
      currentAmountLeft: 0,
    });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ amountLeft: 1 }),
      { $inc: { amountLeft: -1 } },
      expect.objectContaining({ new: true }),
    );
    expect(basicService.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $set: expect.objectContaining({ amountLeft: 2, progress: {} }),
      }),
      expect.anything(),
    );
  });

  it.each([
    [
      'a repeated attack increase after step one',
      StrongerSoldierStep.ATTACK_INCREASED,
      2,
    ],
    [
      'a battle before the attack increase',
      StrongerSoldierStep.BATTLE_PLAYED,
      1,
    ],
  ])('treats %s as a no-op', async (_caseName, step, expectedAmountLeft) => {
    const { model, progressService, service } = createService();
    const session = {
      startTransaction: jest.fn(),
      inTransaction: jest.fn().mockReturnValue(true),
      commitTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (service as any).connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    const [result, errors] = await service.handleDailyTaskEvent({
      playerId: 'player-1',
      serverTaskName: ServerTaskName.STRONGER_SOLDIER,
      strongerSoldierStep: step,
    });

    expect(result).toBeNull();
    expect(errors).toBeNull();
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ amountLeft: expectedAmountLeft }),
      { $inc: { amountLeft: -1 } },
      expect.objectContaining({ new: true, session }),
    );
    expect(progressService.handleProgress).not.toHaveBeenCalled();
  });

  it('ignores a stronger soldier event without a valid step', async () => {
    const { model, service } = createService();

    const [result, errors] = await service.handleDailyTaskEvent({
      playerId: 'player-1',
      serverTaskName: ServerTaskName.STRONGER_SOLDIER,
    });

    expect(result).toBeNull();
    expect(errors).toBeNull();
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
