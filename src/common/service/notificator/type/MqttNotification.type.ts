export type MqttNotification<TPayload> = {
  topic: string;
  type: string;
  payload: TPayload;
};

export function buildMqttNotification<TPayload>(
  topic: string,
  type: string,
  payload: TPayload,
): MqttNotification<TPayload> {
  return {
    topic,
    type,
    payload,
  };
}
