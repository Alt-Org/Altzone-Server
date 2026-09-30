import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';
import RoomNotifier, {
  SoulHomeRoomNotificationType,
} from '../../../../clanInventory/room/room.notifier';
import { RoomStatus } from '../../../../clanInventory/room/enum/roomStatus.enum';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('RoomNotifier notifications', () => {
  let publishMock: jest.Mock;
  let notifier: RoomNotifier;

  beforeEach(() => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
    jest.spyOn(Date, 'now').mockReturnValue(123456789);
    notifier = new RoomNotifier();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('publishes room activation notifications to the soulhome topic', () => {
    notifier.roomActivated({
      clan_id: 'clan-1',
      soulHome_id: 'soulhome-1',
      rooms: [
        {
          _id: 'room-1',
          roomStatus: RoomStatus.ACTIVE,
          deactivationTime: '2026-09-09T12:00:00.000Z',
        },
      ],
    });

    expect(publishMock).toHaveBeenCalledWith(
      '/clan/clan-1/soulhome/soulhome-1/update',
      expect.any(String),
    );

    const [, rawPayload] = publishMock.mock.calls[0];
    expect(JSON.parse(rawPayload)).toEqual({
      topic: 'soulhome',
      type: SoulHomeRoomNotificationType.ROOM_ACTIVATED,
      payload: {
        topic: '/clan/clan-1/soulhome/soulhome-1/update',
        clan_id: 'clan-1',
        soulHome_id: 'soulhome-1',
        rooms: [
          {
            _id: 'room-1',
            roomStatus: RoomStatus.ACTIVE,
            deactivationTime: '2026-09-09T12:00:00.000Z',
          },
        ],
        ts: 123456789,
      },
    });
  });

  it('publishes room deactivation notifications to the soulhome topic', () => {
    notifier.roomDeactivated({
      clan_id: 'clan-1',
      soulHome_id: 'soulhome-1',
      rooms: [
        {
          _id: 'room-1',
          roomStatus: RoomStatus.INACTIVE,
          deactivationTime: '2026-09-09T12:00:00.000Z',
        },
      ],
    });

    expect(publishMock).toHaveBeenCalledWith(
      '/clan/clan-1/soulhome/soulhome-1/update',
      expect.any(String),
    );

    const [, rawPayload] = publishMock.mock.calls[0];
    expect(JSON.parse(rawPayload)).toEqual({
      topic: 'soulhome',
      type: SoulHomeRoomNotificationType.ROOM_DEACTIVATED,
      payload: {
        topic: '/clan/clan-1/soulhome/soulhome-1/update',
        clan_id: 'clan-1',
        soulHome_id: 'soulhome-1',
        rooms: [
          {
            _id: 'room-1',
            roomStatus: RoomStatus.INACTIVE,
            deactivationTime: '2026-09-09T12:00:00.000Z',
          },
        ],
        ts: 123456789,
      },
    });
  });

  it('publishes layout update notifications with single or batch mode', () => {
    notifier.layoutUpdated({
      clan_id: 'clan-1',
      soulHome_id: 'soulhome-1',
      mode: 'batch',
      rooms: [
        {
          _id: 'room-1',
          roomColour: 'green',
          furnitureChanged: false,
        },
        {
          _id: 'room-2',
          floorType: 'stone',
          furnitureChanged: true,
        },
      ],
    });

    expect(publishMock).toHaveBeenCalledWith(
      '/clan/clan-1/soulhome/soulhome-1/update',
      expect.any(String),
    );

    const [, rawPayload] = publishMock.mock.calls[0];
    expect(JSON.parse(rawPayload)).toEqual({
      topic: 'soulhome',
      type: SoulHomeRoomNotificationType.ROOM_LAYOUT_UPDATED,
      payload: {
        topic: '/clan/clan-1/soulhome/soulhome-1/update',
        clan_id: 'clan-1',
        soulHome_id: 'soulhome-1',
        mode: 'batch',
        rooms: [
          {
            _id: 'room-1',
            roomColour: 'green',
            furnitureChanged: false,
          },
          {
            _id: 'room-2',
            floorType: 'stone',
            furnitureChanged: true,
          },
        ],
        ts: 123456789,
      },
    });
  });
});
