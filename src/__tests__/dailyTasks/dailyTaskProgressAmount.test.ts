import { DailyTaskProgressService } from '../../dailyTasks/dailyTaskProgress.service';

describe('DailyTaskProgressService amount handling', () => {
  it('treats amount as a completion requirement, not a points multiplier', async () => {
    const notifier = {
      taskUpdated: jest.fn(),
      taskCompleted: jest.fn(),
      taskCompletedForClan: jest.fn(),
      milestoneReached: jest.fn(),
    };
    const playerRewarder = {
      rewardForPlayerTask: jest.fn().mockResolvedValue([true, null]),
    };
    const clanRewarder = {
      rewardClanForPlayerTask: jest
        .fn()
        .mockResolvedValue([{ _id: 'clan-1' }, null]),
    };
    const clanProgression = {
      handleClanProgression: jest
        .fn()
        .mockResolvedValue([{ reachedMilestones: [] }, null]),
    };
    const session = {} as any;
    const service = new DailyTaskProgressService(
      notifier as any,
      clanRewarder as any,
      playerRewarder as any,
      clanProgression as any,
      {} as any,
    );
    const result = {
      status: 'completed',
      task: {
        clan_id: 'clan-1',
        player_id: 'player-1',
        type: 'play_battle',
        points: 10,
        coins: 5,
        amount: 5,
      },
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      completedAmount: 5,
      previousAmountLeft: 5,
      currentAmountLeft: 0,
    } as any;

    const [handled, errors] = await service.handleProgress(result, session);

    expect(errors).toBeNull();
    expect(handled).toBe(result);
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
    expect(playerRewarder.rewardForPlayerTask).not.toHaveBeenCalledWith(
      'player-1',
      result.task.points * result.task.amount,
      session,
    );
  });
});
