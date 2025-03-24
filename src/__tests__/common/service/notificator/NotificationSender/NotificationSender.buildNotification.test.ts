import { NotificationGroup } from '../../../../../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../../../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../../../../common/service/notificator/enum/NotificationStatus.enum';
import MQTTConnector from '../../../../../common/service/notificator/MQTTConnector';
import NotificationSender from '../../../../../common/service/notificator/NotificationSender';

jest.mock('../../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
  publish: jest.fn(),
}));

describe('NotificationSender.buildNotification() test suite', () => {
  it('Should call MQTTConnector.publish() with valid arguments', () => {
    const mockConnector = {
      getInstance: jest.fn(),
      publish: jest.fn(),
    };

    (MQTTConnector.getInstance as jest.Mock).mockReturnValue(mockConnector);

    const group = NotificationGroup.CLAN;
    const groupId = 'my-testing-group';
    const resource = NotificationResource.DAILY_TASK;
    const resourceId = 'my-testing-resource';
    const status = NotificationStatus.NEW;
    const payload = {
      name: 'Some payload',
      points: 20,
    };

    NotificationSender.buildNotification()
      .addGroup(group, groupId)
      .addResource(resource, resourceId)
      .send(status, payload);

    expect(mockConnector.publish).toHaveBeenCalledWith(
      `/${group}/${groupId}/${resource}/${resourceId}/${status}`,
      JSON.stringify(payload),
    );
  });
});
