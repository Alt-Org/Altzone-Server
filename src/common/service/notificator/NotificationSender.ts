import MQTTConnector from './MQTTConnector';
import { NotificationGroup } from './enum/NotificationGroup.enum';
import { NotificationResource } from './enum/NotificationResource.enum';
import { NotificationStatus } from './enum/NotificationStatus.enum';

/**
 * Class for sending notifications.
 */
export default class NotificationSender {
  protected constructor() {
    this.connector = MQTTConnector.getInstance();
  }

  private readonly connector: MQTTConnector;

  /**
   * Start method of the multi-step builder of the notification.
   *
   * Notice that on the end of the chain a send method will appear, which will send the notification.
   *
   * Notice that you can provide the type of the payload you want to sent, if you need type checking
   * @returns next builder step
   */
  static buildNotification<TPayload = any>(): IAddGroup<TPayload> {
    const notification = new Notification<TPayload>();
    return notification;
  }

  /**
   * Sends a notification
   * @param group to what group the notification is addressed
   * @param group_id _id of the group. If group_id can not be defined an 'undefined' value will be used.
   * @param resource what about the notification is
   * @param resource_id _id of the resource. If the resource_id can not be defined an 'undefined' value will be used.
   * @param status what type of status the notification has
   * @param payload notification content
   */
  protected notify(
    group: NotificationGroup,
    group_id: string = 'undefined',
    resource: NotificationResource,
    resource_id: string = 'undefined',
    status: NotificationStatus,
    payload: any,
  ) {
    const payloadStringified = JSON.stringify(payload);
    this.connector.publish(
      `/${group}/${group_id}/${resource}/${resource_id}/${status}`,
      payloadStringified,
    );
  }
}

/**
 * Internal class for the multi-step notification builder
 */
class Notification<TPayload>
  extends NotificationSender
  implements IAddGroup<TPayload>, IAddResource<TPayload>, ISend<TPayload>
{
  constructor() {
    super();
  }

  group: NotificationGroup;
  group_id: string;
  resource: NotificationResource;
  resource_id: string;
  status: NotificationStatus;
  payload: TPayload;

  addGroup(group: NotificationGroup, group_id?: string) {
    this.group = group;
    this.group_id = group_id;
    return this;
  }
  addResource(resource: NotificationResource, resource_id?: string) {
    this.resource = resource;
    this.resource_id = resource_id;
    return this;
  }
  send(status: NotificationStatus, payload: TPayload) {
    this.status = status;
    this.payload = payload;
    return super.notify(
      this.group,
      this.group_id,
      this.resource,
      this.resource_id,
      this.status,
      this.payload,
    );
  }
}

interface IAddGroup<TPayload> {
  /**
   * Adds group to which the notification should be sent
   * @param group to what group the notification is addressed
   * @param group_id _id of the group. If group_id can not be defined an 'undefined' value will be used.
   * @returns next builder step
   */
  addGroup: (
    group: NotificationGroup,
    group_id?: string,
  ) => IAddResource<TPayload>;
}

interface IAddResource<TPayload> {
  /**
   * Adds resource of the notification
   * @param resource what about the notification is
   * @param resource_id _id of the resource. If the resource_id can not be defined an 'undefined' value will be used.
   * @returns next builder step
   */
  addResource: (
    resource: NotificationResource,
    resource_id?: string,
  ) => ISend<TPayload>;
}

interface ISend<TPayload> {
  /**
   * Sends the built notification
   * @param status what type of status the notification has
   * @param payload notification content
   */
  send: (status: NotificationStatus, payload: TPayload) => void;
}
