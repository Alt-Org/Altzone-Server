import mqtt from "mqtt";
import MQTTConnector from "../../../../../common/service/notificator/MQTTConnector";

jest.mock('mqtt', () => ({
    connect: jest.fn(),
}));

describe('MQTTConnector.getInstance() test suite', () => {
    it('Should return an instance of the MQTTConnector', () => {
        const instance = MQTTConnector.getInstance();
        expect(instance).toBeInstanceOf(MQTTConnector);
    });

    it('Should call mqtt.connect() only once', () => {
        const mockClient = {};
        
        (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

        MQTTConnector.getInstance();
        MQTTConnector.getInstance();

        expect(mqtt.connect).toHaveBeenCalledTimes(1);
    });
});