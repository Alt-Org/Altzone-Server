import { DailyTaskProgressService } from '../../dailyTasks/dailyTaskProgress.service';

describe('DailyTaskProgressService', () => {
  let notifier: any;
  let playerRewarder: any;
  let clanRewarder: any;
  let clanProgression: any;
  let service: DailyTaskProgressService;
  const session = {} as any;

  const makeResult = (
    status: 'advanced' | 'completed',
    taskType: string,
    points = 10,
    coins = 5,
  ) =>
    ({
      status,
      task: {
        clan_id: 'clan-1',
        player_id: 'player-1',
        type: taskType,
        points,
        coins,
      },
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      completedAmount: 1,
      previousAmountLeft: 2,
      currentAmountLeft: status === 'advanced' ? 1 : 0,
    }) as any;

  beforeEach(() => {
    notifier = {
      taskUpdated: jest.fn(),
      taskCompleted: jest.fn(),
      taskCompletedForClan: jest.fn(),
      milestoneReached: jest.fn(),
    };

    playerRewarder = {
      rewardForPlayerTask: jest.fn().mockResolvedValue([null, null]),
    };

    clanRewarder = {
      rewardClanForPlayerTask: jest
        .fn()
        .mockResolvedValue([{ _id: 'clan-1' }, null]),
    };

    clanProgression = {
      handleClanProgression: jest
        .fn()
        .mockResolvedValue([{ reachedMilestones: [] }, null]),
    };

    service = new DailyTaskProgressService(
      notifier,
      clanRewarder,
      playerRewarder,
      clanProgression,
      {} as any,
    );
  });

  it('should update server task without completing it', async () => {
    const result = makeResult('advanced', 'serverTask');
    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled).toBe(result);
    expect(notifier.taskUpdated).toHaveBeenCalledWith('player-1', result.task);
    expect(notifier.taskCompleted).not.toHaveBeenCalled();
    expect(clanRewarder.rewardClanForPlayerTask).not.toHaveBeenCalled();
    expect(clanProgression.handleClanProgression).not.toHaveBeenCalled();
    expect(notifier.milestoneReached).not.toHaveBeenCalled();
  });

  it('should update UI task without completing it', async () => {
    const result = makeResult('advanced', 'uiTask');
    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled).toBe(result);
    expect(notifier.taskUpdated).toHaveBeenCalledWith('player-1', result.task);
    expect(notifier.taskCompleted).not.toHaveBeenCalled();
    expect(clanRewarder.rewardClanForPlayerTask).not.toHaveBeenCalled();
    expect(clanProgression.handleClanProgression).not.toHaveBeenCalled();
    expect(notifier.milestoneReached).not.toHaveBeenCalled();
  });

  it('should complete server task and notify player and clan', async () => {
    const result = makeResult('completed', 'serverTask');
    clanProgression.handleClanProgression.mockResolvedValue([
      { reachedMilestones: [100] },
      null,
    ]);

    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled.reachedMilestones).toEqual([100]);
    expect(playerRewarder.rewardForPlayerTask).toHaveBeenCalledWith(
      'player-1',
      result.task.points,
      session,
    );
    expect(clanRewarder.rewardClanForPlayerTask).toHaveBeenCalledWith(
      'clan-1',
      result.task.points,
      result.task.coins,
      session,
    );
    expect(notifier.taskCompleted).toHaveBeenCalledWith(
      'player-1',
      result.task,
    );
    expect(notifier.taskCompletedForClan).toHaveBeenCalledWith(
      'clan-1',
      result.task,
      'player-1',
    );
    expect(notifier.milestoneReached).toHaveBeenCalledWith(
      'clan-1',
      result.task,
      'player-1',
      [100],
    );
  });

  it('should complete UI task and notify player and clan', async () => {
    const result = makeResult('completed', 'uiTask');
    clanProgression.handleClanProgression.mockResolvedValue([
      { reachedMilestones: [200] },
      null,
    ]);

    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled.reachedMilestones).toEqual([200]);
    expect(notifier.taskCompleted).toHaveBeenCalledWith(
      'player-1',
      result.task,
    );
    expect(notifier.taskCompletedForClan).toHaveBeenCalledWith(
      'clan-1',
      result.task,
      'player-1',
    );
    expect(notifier.milestoneReached).toHaveBeenCalledWith(
      'clan-1',
      result.task,
      'player-1',
      [200],
    );
  });

  it('should not send milestone notification when no new milestones were reached', async () => {
    const result = makeResult('completed', 'serverTask');
    clanProgression.handleClanProgression.mockResolvedValue([
      { reachedMilestones: [] },
      null,
    ]);

    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled.reachedMilestones).toEqual([]);
    expect(notifier.taskCompleted).toHaveBeenCalled();
    expect(notifier.taskCompletedForClan).toHaveBeenCalled();
    expect(notifier.milestoneReached).not.toHaveBeenCalled();
  });

  it('should handle multiple milestones reached in a single completion', async () => {
    const result = makeResult('completed', 'serverTask');
    clanProgression.handleClanProgression.mockResolvedValue([
      { reachedMilestones: [100, 200] },
      null,
    ]);

    const [handled, error] = await service.handleProgress(result, session);

    expect(error).toBeNull();
    expect(handled.reachedMilestones).toEqual([100, 200]);
    expect(notifier.milestoneReached).toHaveBeenCalledWith(
      'clan-1',
      result.task,
      'player-1',
      [100, 200],
    );
  });
});
