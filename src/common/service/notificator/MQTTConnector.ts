import mqtt, { MqttClient } from "mqtt";
import { envVars } from "../envHandler/envVars";

/**
 * Class for handling direct communications with MQTT broker.
 *
 * Notice that it is a singleton
 */
export default class MQTTConnector {
    private constructor() {
        MQTTConnector.client = this.connect();
    }

    private static client: MqttClient;
    private static instance: MQTTConnector; 

    /**
     * Gets instance of the MQTTConnector class.
     * @returns MQTTConnector class instance
     */
    static getInstance(){
        if(!MQTTConnector.instance)
            MQTTConnector.instance = new MQTTConnector();

        return MQTTConnector.instance;
    }

    /**
     * Connects to MQTT broker.
     *
     * Notice that most likely the class is already connected 
     * since it is happen on the MQTTConnector class instance creation. 
     * So if you did not disconnected, you do not need to use this method.
     * @returns MQTTClient from the mqtt library.
     */
    connect(){
        return mqtt.connect(
            `mqtt://${envVars.MOSQUITTO_HOST}:${envVars.MOSQUITTO_PORT}`, 
            { 
                username: envVars.MOSQUITTO_PUBLISHER, 
                password: envVars.MOSQUITTO_PUBLISHER_PASSWORD
            }
        );
    }

    /**
     * Disconnects from the MQTT broker.
     */
    async disconnect(){
        MQTTConnector.client.endAsync();
    }

    /**
     * Publish a message to specified topic.
     *
     * Notice that you will not get any success / error response since it is not supported by MQTT.
     * @param topic where to publish
     * @param payload what to publish
     */
    async publish(topic: string, payload: string | Buffer){
        MQTTConnector.client.publishAsync(topic, payload);
    }
}