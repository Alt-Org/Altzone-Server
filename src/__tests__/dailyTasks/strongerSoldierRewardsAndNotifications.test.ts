import MQTTConnector from '../../common/service/notificator/MQTTConnector';
import { MqttNotificationType } from '../../common/service/notificator/enum/MqttNotificationType.enum';
import DailyTaskNotifier from '../../dailyTasks/dailyTask.notifier';
import { DailyTaskProgressService } from '../../dailyTasks/dailyTaskProgress.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';

jest.mock('../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('STRONGER_SOLDIER rewards and MQTT notifications', () => {
  let publish: jest.Mock;
  let playerRewarder: { rewardForPlayerTask: jest.Mock };
  let clanRewarder: { rewardClanForPlayerTask: jest.Mock };
  let clanProgression: { handleClanProgression: jest.Mock };
  let service: DailyTaskProgressService;

  const session = {} as any;
  const task = {
    _id: 'task-1',
    clan_id: 'clan-1',
    player_id: 'player-1',
    type: ServerTaskName.STRONGER_SOLDIER,
    title: { fi: 'Kasvata puolustussotilaan hyökkäysarvoa.' },
    amount: 2,
    amountLeft: 1,
    points: 10,
    coins: 5,
  };

  beforeEach(() => {
    publish = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({ publish });
    playerRewarder = {
      rewardForPlayerTask: jest.fn().mockResolvedValue([true, null]),
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
      new DailyTaskNotifier(),
      clanRewarder as any,
      playerRewarder as any,
      clanProgression as any,
      {} as any,
    );
  });

  it('publishes the normal player update after the first step', async () => {
    const result = {
      status: 'advanced' as const,
      task,
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      completedAmount: 1,
      previousAmountLeft: 2,
      currentAmountLeft: 1,
    };

    const [handled, errors] = await service.handleProgress(result, session);

    expect(errors).toBeNull();
    expect(handled).toBe(result);
    expect(publish).toHaveBeenCalledWith(
      '/player/player-1/daily_task/stronger_soldier/update',
      JSON.stringify({
        topic: 'daily_task',
        type: MqttNotificationType.TASK_UPDATED,
        payload: task,
      }),
    );
    expect(playerRewarder.rewardForPlayerTask).not.toHaveBeenCalled();
    expect(clanRewarder.rewardClanForPlayerTask).not.toHaveBeenCalled();
  });

  it('rewards the player and clan and publishes all completion topics', async () => {
    const completedTask = { ...task, amountLeft: 0 };
    const result = {
      status: 'completed' as const,
      task: completedTask,
      completedByPlayerId: 'player-1',
      clanId: 'clan-1',
      completedAmount: 1,
      previousAmountLeft: 1,
      currentAmountLeft: 0,
    };
    clanProgression.handleClanProgression.mockResolvedValueOnce([
      { reachedMilestones: [100] },
      null,
    ]);

    const [handled, errors] = await service.handleProgress(result, session);

    expect(errors).toBeNull();
    expect(handled.reachedMilestones).toEqual([100]);
    expect(playerRewarder.rewardForPlayerTask).toHaveBeenCalledWith(
      'player-1',
      completedTask.points,
      session,
    );
    expect(clanRewarder.rewardClanForPlayerTask).toHaveBeenCalledWith(
      'clan-1',
      completedTask.points,
      completedTask.coins,
      session,
    );
    expect(publish).toHaveBeenCalledWith(
      '/player/player-1/daily_task/stronger_soldier/end',
      JSON.stringify({
        topic: 'daily_task',
        type: MqttNotificationType.TASK_COMPLETED,
        payload: completedTask,
      }),
    );
    expect(publish).toHaveBeenCalledWith(
      '/clan/clan-1/daily_task/stronger_soldier/end',
      JSON.stringify({
        topic: 'daily_task',
        type: MqttNotificationType.CLAN_TASK_COMPLETED,
        payload: {
          task: completedTask,
          completedByPlayerId: 'player-1',
        },
      }),
    );
    expect(publish).toHaveBeenCalledWith(
      '/clan/clan-1/daily_task/milestone/update',
      JSON.stringify({
        topic: 'daily_task',
        type: MqttNotificationType.MILESTONE_REACHED,
        payload: {
          task: completedTask,
          completedByPlayerId: 'player-1',
          reachedMilestones: [100],
        },
      }),
    );
  });
});
