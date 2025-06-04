import MQTTConnector from '../../../../../common/service/notificator/MQTTConnector';

describe('MQTTConnector.getInstance() test suite', () => {
  it('Should return an instance of the MQTTConnector', () => {
    const instance = MQTTConnector.getInstance();
    expect(instance).toBeInstanceOf(MQTTConnector);
  });
});
