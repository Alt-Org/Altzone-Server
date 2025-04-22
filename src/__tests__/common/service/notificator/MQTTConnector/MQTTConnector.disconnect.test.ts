import mqtt from 'mqtt';
import MQTTConnector from '../../../../../common/service/notificator/MQTTConnector';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('MQTTConnector.disconnect() test suite', () => {
  it('Should call MqttClient.endAsync()', () => {
    const mockClient = {
      endAsync: jest.fn().mockResolvedValue(undefined),
    };

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    const connector = MQTTConnector.getInstance();

    connector.disconnect();

    expect(mockClient.endAsync).toHaveBeenCalled();
  });
});
