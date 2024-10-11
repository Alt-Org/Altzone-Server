import mqtt, { MqttClient } from "mqtt";
import { envVars } from "../envHandler/envVars";

export default class MQTTConnector {
    private constructor() {
        MQTTConnector.client = this.connect();
    }

    private static client: MqttClient;
    private static instance: MQTTConnector; 

    static getInstance(){
        if(!MQTTConnector.instance)
            MQTTConnector.instance = new MQTTConnector();

        return MQTTConnector.instance;
    }

    connect(){
        return mqtt.connect(
            `mqtt://${envVars.MOSQUITTO_HOST}:${envVars.MOSQUITTO_PORT}`, 
            { 
                username: envVars.MOSQUITTO_PUBLISHER, 
                password: envVars.MOSQUITTO_PUBLISHER_PASSWORD
            }
        );
    }

    async disconnect(){
        return MQTTConnector.client.endAsync();
    }

    async publish(topic: string, payload: string | Buffer){
        MQTTConnector.client.publishAsync(topic, payload);
    }
}