import mqtt from "mqtt";
import MQTTConnector from "../../../../../common/service/notificator/MQTTConnector";
import { envVars } from "../../../../../common/service/envHandler/envVars";

jest.mock('mqtt', () => ({
    connect: jest.fn(),
}));

describe('MQTTConnector.connect() test suite', () => {
    it('Should call mqtt.connect() with valid arguments', () => {
        const mockClient = {};
        
        (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

        const connector = MQTTConnector.getInstance();

        connector.connect();

        expect(mqtt.connect).toHaveBeenCalledWith(`mqtt://${envVars.MOSQUITTO_HOST}:${envVars.MOSQUITTO_PORT}`, { 
            username: envVars.MOSQUITTO_PUBLISHER, 
            password: envVars.MOSQUITTO_PUBLISHER_PASSWORD
        });
    });
});