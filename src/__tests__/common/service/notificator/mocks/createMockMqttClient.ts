import mqtt, { MqttClient } from 'mqtt';

export default function createMockMqttClient(topic?: string, payload?: any) {
  const publishAsyncMock = jest.fn().mockResolvedValue({
    cmd: 'publish',
    qos: 0,
    dup: false,
    retain: false,
    topic: topic ?? undefined,
    payload: payload ?? undefined,
  });

  const mockClient = {
    publishAsync: publishAsyncMock,
  } as unknown as MqttClient;

  (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

  return { publishAsyncMock, mockClient };
}
