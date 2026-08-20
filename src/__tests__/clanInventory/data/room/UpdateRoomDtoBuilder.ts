import { UpdateRoomDto } from '../../../../clanInventory/room/dto/updateRoom.dto';

export default class UpdateRoomDtoBuilder {
  private readonly base: Partial<UpdateRoomDto> = {
    _id: undefined,
    roomColour: undefined,
    floorType: undefined,
    wallpaper: undefined,
  };

  build(): UpdateRoomDto {
    return { ...this.base } as UpdateRoomDto;
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
