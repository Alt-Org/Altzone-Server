import { RoomStatus } from '../../../../clanInventory/room/enum/roomStatus.enum';
import { Room } from '../../../../clanInventory/room/room.schema';

export default class RoomBuilder {
  private readonly base: Partial<Room> = {
    roomPosition: 1,
    roomColour: 'defaultColor',
    floorType: 'defaultFloor',
    wallpaper: 'defaultWall',
    deactivationTime: null,
    soulHome_id: undefined,
    roomStatus: RoomStatus.ACTIVE,
    _id: undefined,
  };

  build() {
    return { ...this.base } as Room;
  }

  setRoomPosition(position: number) {
    this.base.roomPosition = position;
    return this;
  }

  setRoomColour(colour: string) {
    this.base.roomColour = colour;
    return this;
  }

  setFloorType(floorType: string) {
    this.base.floorType = floorType;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }

  setDeactivationTime(time: Date) {
    this.base.deactivationTime = time;
    return this;
  }

  setSoulHomeId(soulHomeId: string) {
    this.base.soulHome_id = soulHomeId;
    return this;
  }

  setRoomStatus(status: RoomStatus) {
    this.base.roomStatus = status;
    return this;
  }

  setId(_id: string) {
    this.base._id = _id;
    return this;
  }
}
