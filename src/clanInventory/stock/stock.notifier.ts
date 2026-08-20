import { Injectable } from '@nestjs/common';
import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../../common/service/notificator/enum/MqttNotificationType.enum';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';
import {
  buildMqttNotification,
  MqttNotification,
} from '../../common/service/notificator/type/MqttNotification.type';
import { StockNotificationPayload } from './type/stockNotificationPayload.type';

type StockNotificationInput = Omit<StockNotificationPayload, 'topic' | 'ts'>;

@Injectable()
export default class StockNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.STOCK;
  private readonly resourceId = 'item';

  itemAdded(payload: StockNotificationInput) {
    this.sendStockNotification(
      payload,
      MqttNotificationType.STOCK_ITEM_ADDED,
      NotificationStatus.NEW,
    );
  }

  itemRemoved(payload: StockNotificationInput) {
    this.sendStockNotification(
      payload,
      MqttNotificationType.STOCK_ITEM_REMOVED,
      NotificationStatus.UPDATE,
    );
  }

  private sendStockNotification(
    payload: StockNotificationInput,
    type:
      | MqttNotificationType.STOCK_ITEM_ADDED
      | MqttNotificationType.STOCK_ITEM_REMOVED,
    status: NotificationStatus.NEW | NotificationStatus.UPDATE,
  ) {
    const topic = `/${this.group}/${payload.clan_id}/${this.resource}/${this.resourceId}/${status}`;
    const notificationPayload: StockNotificationPayload = {
      ...payload,
      topic,
      ts: Date.now(),
    };
    const notification = buildMqttNotification(
      this.resource,
      type,
      notificationPayload,
    );

    NotificationSender.buildNotification<
      MqttNotification<StockNotificationPayload>
    >()
      .addGroup(this.group, payload.clan_id)
      .addResource(this.resource, this.resourceId)
      .send(status, notification);
  }
}
