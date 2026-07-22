import { ObjectId } from 'mongodb';
import { RoomDto } from '../../../../clanInventory/room/dto/room.dto';

export default class RoomDtoBuilder {
  private readonly base: Partial<RoomDto> = {
    _id: new ObjectId().toString(),
    roomColour: undefined,
    floor: undefined,
    wallpaper: undefined,
  };

  build(): RoomDto {
    return { ...this.base } as RoomDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setRoomColour(colour: string) {
    this.base.roomColour = colour;
    return this;
  }

  setFloor(floor: string) {
    this.base.floor = floor;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }
}
