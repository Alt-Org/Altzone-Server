import { Injectable } from '@nestjs/common';
import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';
import {
  buildMqttNotification,
  MqttNotification,
} from '../../common/service/notificator/type/MqttNotification.type';
import { RoomStatus } from './enum/roomStatus.enum';

export const SoulHomeRoomNotificationType = {
  ROOM_ACTIVATED: 'SOULHOME_ROOM_ACTIVATED',
  ROOM_DEACTIVATED: 'SOULHOME_ROOM_DEACTIVATED',
  ROOM_LAYOUT_UPDATED: 'SOULHOME_ROOM_LAYOUT_UPDATED',
} as const;

export type SoulHomeRoomNotificationType =
  (typeof SoulHomeRoomNotificationType)[keyof typeof SoulHomeRoomNotificationType];

export type SoulHomeRoomLayoutMode = 'single' | 'batch';

export type SoulHomeRoomChangePayload = {
  _id: string;
  roomPosition?: number;
  roomStatus?: RoomStatus;
  deactivationTime?: Date | string | null;
  roomColour?: string;
  wallpaper?: string;
  floorType?: string;
  furnitureChanged?: boolean;
};

export type SoulHomeRoomNotificationInput = {
  clan_id: string;
  soulHome_id: string;
  rooms: SoulHomeRoomChangePayload[];
};

export type SoulHomeRoomLayoutNotificationInput =
  SoulHomeRoomNotificationInput & {
    mode: SoulHomeRoomLayoutMode;
  };

export type SoulHomeRoomNotificationPayload = SoulHomeRoomNotificationInput & {
  topic: string;
  mode?: SoulHomeRoomLayoutMode;
  ts: number;
};

@Injectable()
export default class RoomNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = 'soulhome' as NotificationResource;

  roomActivated(payload: SoulHomeRoomNotificationInput) {
    this.sendSoulHomeNotification(
      payload,
      SoulHomeRoomNotificationType.ROOM_ACTIVATED,
    );
  }

  roomDeactivated(payload: SoulHomeRoomNotificationInput) {
    this.sendSoulHomeNotification(
      payload,
      SoulHomeRoomNotificationType.ROOM_DEACTIVATED,
    );
  }

  layoutUpdated(payload: SoulHomeRoomLayoutNotificationInput) {
    this.sendSoulHomeNotification(
      payload,
      SoulHomeRoomNotificationType.ROOM_LAYOUT_UPDATED,
    );
  }

  private sendSoulHomeNotification(
    payload:
      | SoulHomeRoomNotificationInput
      | SoulHomeRoomLayoutNotificationInput,
    type: SoulHomeRoomNotificationType,
  ) {
    const topic = `/${this.group}/${payload.clan_id}/${this.resource}/${payload.soulHome_id}/update`;
    const notificationPayload: SoulHomeRoomNotificationPayload = {
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
      MqttNotification<SoulHomeRoomNotificationPayload>
    >()
      .addGroup(this.group, payload.clan_id)
      .addResource(this.resource, payload.soulHome_id)
      .send(NotificationStatus.UPDATE, notification);
  }
}
