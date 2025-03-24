import mqtt from 'mqtt';
import MQTTConnector from '../../../../../common/service/notificator/MQTTConnector';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('MQTTConnector.publish() test suite', () => {
  it('Should call MqttClient.publishAsync() with valid arguments', () => {
    const topicToPublish = 'my-topic';
    const payloadsToPublish = 'Some msg';

    const mockClient = {
      publishAsync: jest.fn().mockResolvedValue(undefined),
    };

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    const connector = MQTTConnector.getInstance();

    connector.publish(topicToPublish, payloadsToPublish);

    expect(mockClient.publishAsync).toHaveBeenCalledWith(
      topicToPublish,
      payloadsToPublish,
    );
  });
});
