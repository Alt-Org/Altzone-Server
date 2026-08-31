import { ObjectId } from 'mongodb';
import { RoomDto } from '../../../../clanInventory/room/dto/room.dto';

export default class RoomDtoBuilder {
  private readonly base: Partial<RoomDto> = {
    _id: new ObjectId().toString(),
    roomColour: undefined,
    floorType: undefined,
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

  setFloorType(floorType: string) {
    this.base.floorType = floorType;
    return this;
  }

  setWallpaper(wallpaper: string) {
    this.base.wallpaper = wallpaper;
    return this;
  }
}
