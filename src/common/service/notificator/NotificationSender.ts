import MQTTConnector from "./MQTTConnector";
import { NotificationGroup } from "./enum/NotificationGroup.enum";
import { NotificationResource } from "./enum/NotificationResource.enum";
import { NotificationStatus } from "./enum/NotificationStatus.enum";

export default class NotificationSender {
    protected constructor() {
        this.connector = MQTTConnector.getInstance();
    }

    private readonly connector: MQTTConnector;

    static buildNotification<TPayload=any>(): IAddGroup<TPayload>{
        const notification = new Notification<TPayload>();
        return notification;
    }

    protected notify(
        group: NotificationGroup, 
        group_id: string='undefined', 
        resource: NotificationResource,
        resource_id: string='undefined', 
        status: NotificationStatus, 
        payload: any
    ){
        const payloadStringified = JSON.stringify(payload);
        this.connector.publish(`/${group}/${group_id}/${resource}/${resource_id}/${status}`, payloadStringified);
    }
}

class Notification<TPayload> extends NotificationSender implements IAddGroup<TPayload>, IAddResource<TPayload>, ISend<TPayload>{
    constructor() {
        super();
    }

    group: NotificationGroup;
    group_id: string;
    resource: NotificationResource;
    resource_id: string;
    status: NotificationStatus;
    payload: TPayload;

    addGroup(group: NotificationGroup, group_id?: string){
        this.group = group;
        this.group_id = group_id;
        return this;
    }
    addResource(resource: NotificationResource, resource_id?: string){
        this.resource = resource;
        this.resource_id = resource_id;
        return this;
    }
    send(status: NotificationStatus, payload: TPayload){
        this.status = status;
        this.payload = payload;
        return super.notify(this.group, this.group_id, this.resource, this.resource_id, this.status, this.payload);
    }
}

interface IAddGroup<TPayload> {
    addGroup: (group: NotificationGroup, group_id?: string) => IAddResource<TPayload>;
}

interface IAddResource<TPayload> {
    addResource: (resource: NotificationResource, resource_id?: string) => ISend<TPayload>;
}

interface ISend<TPayload> {
    send: (status: NotificationStatus, payload: TPayload) => void;
}