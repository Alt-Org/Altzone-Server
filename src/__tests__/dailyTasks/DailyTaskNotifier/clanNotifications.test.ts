import DailyTaskNotifier from '../../../dailyTasks/dailyTask.notifier';
import { UITaskName } from '../../../dailyTasks/enum/uiTaskName.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import MQTTConnector from '../../../common/service/notificator/MQTTConnector';

jest.mock('../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('DailyTaskNotifier clan notifications', () => {
  let notifier: DailyTaskNotifier;
  let publishMock: jest.Mock;

  const clanId = 'clan-1';
  const playerId = 'player-1';
  const task = {
    type: UITaskName.CHANGE_LANGUAGE,
    points: 10,
    coins: 5,
  };

  beforeEach(() => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
    notifier = new DailyTaskNotifier();
  });

  it('Should send task completed notification to clan', () => {
    notifier.taskCompletedForClan(clanId, task, playerId);

    const expectedTopic = `/${NotificationGroup.CLAN}/${clanId}/${NotificationResource.DAILY_TASK}/${task.type}/${NotificationStatus.END}`;
    const expectedPayload = JSON.stringify({
      task,
      completedByPlayerId: playerId,
    });

    expect(publishMock).toHaveBeenCalledWith(expectedTopic, expectedPayload);
  });

  it('Should send milestone reached notification to clan', () => {
    const reachedMilestones = [100, 200];

    notifier.milestoneReached(clanId, task, playerId, reachedMilestones);

    const expectedTopic = `/${NotificationGroup.CLAN}/${clanId}/${NotificationResource.DAILY_TASK}/milestone/${NotificationStatus.UPDATE}`;
    const expectedPayload = JSON.stringify({
      task,
      completedByPlayerId: playerId,
      reachedMilestones,
    });

    expect(publishMock).toHaveBeenCalledWith(expectedTopic, expectedPayload);
  });
});
